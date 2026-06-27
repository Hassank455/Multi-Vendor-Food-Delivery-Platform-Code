import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { AppErrorImpl } from "../errors/customApiError";
import { RoleEnum } from "../generated/prisma/enums";
import { NonCustomerRole, verifyAccess } from "../utils/jwt";

async function authenticateCustomerAccess(
  customerId: number,
  req: Request,
) {
  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new BadRequestError("Invalid customer identity");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      user: {
        isActive: 1,
        role: RoleEnum.CUSTOMER,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!customer) {
    throw new UnAuthenticatedError("Invalid or inactive customer account");
  }

  req.customer = { id: customer.id };
  req.user = {
    id: customer.userId,
    role: RoleEnum.CUSTOMER,
  };
}

async function authenticateUserAccess(
  userId: number,
  role: NonCustomerRole,
  req: Request,
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new BadRequestError("Invalid user identity");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isActive: 1,
      role,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new UnAuthenticatedError("Invalid or inactive user account");
  }

  req.user = {
    id: user.id,
    role: user.role,
  };
}

async function authenticateRequest(req: Request) {
  const authorization = req.get("authorization");

  if (!authorization) {
    throw new UnAuthenticatedError("Please provide the authorization header");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnAuthenticatedError(
      "You must be logged in to access this endpoint",
    );
  }

  try {
    const payload = verifyAccess(token);

    if (payload.role === RoleEnum.CUSTOMER) {
      await authenticateCustomerAccess(payload.customerId, req);
      return;
    }

    await authenticateUserAccess(payload.userId, payload.role, req);
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
}

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  void authenticateRequest(req)
    .then(() => next())
    .catch(next);
};

export default isAuth;
