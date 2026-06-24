import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";
import { RoleEnum } from "../generated/prisma/enums";

const allowRoles =
  (...allowedRoles: RoleEnum[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) {
      return next(new ForbiddenError("User role is required"));
    }

    if (!allowedRoles.includes(role)) {
      return next(new ForbiddenError("You are not allowed to access this resource"));
    }

    next();
  };

export default allowRoles;
