import { Request } from "express";
import { RoleEnum } from "../generated/prisma/enums";

export interface CustomRequest extends Request {
  user?: {
    id: number;
    role: RoleEnum;
  };
  customer?: {
    id: number;
  };
}
