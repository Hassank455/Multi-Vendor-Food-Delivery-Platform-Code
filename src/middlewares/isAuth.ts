import jwt, {
  JsonWebTokenError,
  JwtPayload as JwtPayloadType,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { Response, NextFunction } from "express";
import prisma from "../lib/prisma";

import { CustomRequest } from "../common/tdos";
import { AppErrorImpl } from "../errors/customApiError";

// Temporary development-only switch.
// Remove this helper and its usages once real customer auth/login is ready.
const isDevHeaderAuthEnabled = () =>
  process.env.ENABLE_DEV_AUTH_HEADER === "true" &&
  process.env.NODE_ENV !== "production";

// Temporary fallback for local development before JWT customer login exists.
// It injects req.customer.id from x-customer-id so controllers can keep using
// the final contract without bringing customerId back into request bodies.
const authenticateWithDevCustomerHeader = async (req: CustomRequest) => {
  const customerIdHeader = req.get("x-customer-id");

  if (!customerIdHeader) {
    throw new UnAuthenticatedError("Please provide the authorization header");
  }

  const customerId = Number(customerIdHeader);
  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new BadRequestError("Invalid x-customer-id header");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new UnAuthenticatedError("Invalid development customer identity");
  }

  req.customer = { id: customer.id };
};

const authenticateRequest = async (req: CustomRequest) => {
  const authorization = req.get("authorization");

  if (!authorization) {
    // Only when Authorization is missing do we allow the dev header fallback.
    // If a Bearer token is provided but invalid, we fail fast instead of masking
    // the auth bug with the temporary development path.
    if (isDevHeaderAuthEnabled()) {
      await authenticateWithDevCustomerHeader(req);
      return;
    }

    throw new UnAuthenticatedError("Please provide the authorization header");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnAuthenticatedError(
      "You must be logged in to access this endpoint",
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    // This is the real auth path that should remain after the temporary
    // x-customer-id fallback is removed.
    const payload: JwtPayloadType = jwt.verify(
      token,
      jwtSecret,
    ) as JwtPayloadType;

    if (!payload.userId && !payload.customerId) {
      throw new BadRequestError("Couldn't verify the token!");
    }

    if (payload.userId) {
      req.user = { id: +payload.userId };
    } else if (payload.customerId) {
      req.customer = {
        id: payload.customerId,
      };
    }
  } catch (error) {
    if (error instanceof AppErrorImpl) {
      throw error;
    }

    if (error instanceof TokenExpiredError) {
      throw new UnAuthenticatedError(
        "Your session has expired, please log in again",
      );
    }

    if (error instanceof JsonWebTokenError || error instanceof NotBeforeError) {
      throw new UnAuthenticatedError("Invalid authentication credentials");
    }

    throw error;
  }
};

const isAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  void authenticateRequest(req)
    .then(() => next())
    .catch(next);
};

export default isAuth;
