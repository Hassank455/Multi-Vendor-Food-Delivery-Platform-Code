import { RoleEnum } from "../generated/prisma/enums";
import { AppError } from "./error";

declare global {
  namespace Express {
    interface Request {
      error?: AppError;
      user?: {
        id: number;
        role: RoleEnum;
      };
      customer?: {
        id: number;
      };
    }
  }
}

export {};
