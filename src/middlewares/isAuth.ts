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
import { RoleEnum } from "../generated/prisma/enums";

// Temporary development-only switch.
// Remove this helper and its usages once real customer auth/login is ready.
const isDevHeaderAuthEnabled = () =>
  process.env.ENABLE_DEV_AUTH_HEADER === "true" &&
  process.env.NODE_ENV !== "production";

const authenticateActiveCustomerById = async (
  customerId: number,
  req: CustomRequest,
) => {
  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new BadRequestError("Invalid customer identity");
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
    throw new UnAuthenticatedError("Invalid or deactivated customer account");
  }

  req.customer = { id: customer.id };
};

const authenticateActiveRestaurantOwnerById = async (
  userId: number,
  req: CustomRequest,
) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new BadRequestError("Invalid user identity");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      role: RoleEnum.RESTAURANT_OWNER,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new UnAuthenticatedError(
      "Invalid or deactivated restaurant owner account",
    );
  }

  req.user = { id: user.id };
};

// Temporary fallback for local development before JWT customer login exists.
// It injects req.customer.id from x-customer-id so controllers can keep using
// the final contract without bringing customerId back into request bodies.
const authenticateWithDevCustomerHeader = async (req: CustomRequest) => {
  const customerIdHeader = req.get("x-customer-id");

  if (!customerIdHeader) {
    throw new UnAuthenticatedError("Please provide the authorization header");
  }

  const customerId = Number(customerIdHeader);

  await authenticateActiveCustomerById(customerId, req);
};

// Temporary fallback for local development before JWT restaurant-owner login
// exists. It injects req.user.id from x-user-id so restaurant controllers can
// use the final auth contract during development without requiring real tokens.
const authenticateWithDevUserHeader = async (req: CustomRequest) => {
  const userIdHeader = req.get("x-user-id");

  if (!userIdHeader) {
    throw new UnAuthenticatedError("Please provide the authorization header");
  }

  const userId = Number(userIdHeader);

  await authenticateActiveRestaurantOwnerById(userId, req);
};

// Development-only auth fallback selector. We prefer x-user-id when present so
// restaurant-owner endpoints can be tested the same way customer endpoints use
// x-customer-id during local development.
const authenticateWithDevHeaders = async (req: CustomRequest) => {
  const userIdHeader = req.get("x-user-id");
  const customerIdHeader = req.get("x-customer-id");

  if (userIdHeader) {
    await authenticateWithDevUserHeader(req);
    return;
  }

  if (customerIdHeader) {
    await authenticateWithDevCustomerHeader(req);
    return;
  }

  throw new UnAuthenticatedError("Please provide the authorization header");
};

const authenticateRequest = async (req: CustomRequest) => {
  const authorization = req.get("authorization");

  if (!authorization) {
    // Only when Authorization is missing do we allow the dev header fallback.
    // If a Bearer token is provided but invalid, we fail fast instead of masking
    // the auth bug with the temporary development path.
    if (isDevHeaderAuthEnabled()) {
      await authenticateWithDevHeaders(req);
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
      await authenticateActiveRestaurantOwnerById(Number(payload.userId), req);
    } else if (payload.customerId) {
      await authenticateActiveCustomerById(Number(payload.customerId), req);
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
