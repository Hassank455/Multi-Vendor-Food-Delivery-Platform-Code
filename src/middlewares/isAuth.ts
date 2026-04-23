import jwt, { JwtPayload as JwtPayloadType } from "jsonwebtoken";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { Response, NextFunction } from "express";

import { CustomRequest } from "../common/tdos";

const isAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
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

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const payload: JwtPayloadType = jwt.verify(
      token,
      jwtSecret,
    ) as JwtPayloadType;

    if (!payload.ownerId && !payload.userId) {
      throw new BadRequestError("Couldn't verify the token!");
    }

    if (payload.userId) {
      req.user = { id: +payload.userId };
    } else if (payload.customerId) {
      req.customer = {
        id: payload.customerId,
      };
    }
    next();
  } catch (error) {
    throw new UnAuthenticatedError("The session is expired!");
  }
};

export default isAuth;
