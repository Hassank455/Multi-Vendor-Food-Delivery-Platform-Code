import jwt, { JwtPayload as JwtPayloadType } from "jsonwebtoken";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { Response, NextFunction } from "express";

import { CustomRequest } from "../common/tdos";

const isAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    throw new UnAuthenticatedError("Please provide the authorization header");
  }
  const token: string = authorization.split(" ")[1];
  if (!token) {
    throw new UnAuthenticatedError(
      "You must be logged in to access this endpoint",
    );
  }

  try {
    const payload: JwtPayloadType = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`,
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
