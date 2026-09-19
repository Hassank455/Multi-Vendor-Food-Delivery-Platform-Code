import { RoleEnum } from "../generated/prisma/enums";
import { AppError } from "./error";

declare global {
  namespace Express {
    // Extend Express.Request globally so TypeScript understands that every
    // request in this project may also carry authenticated `user` and
    // `customer` data added by our middleware.
    //
    // After this augmentation, anywhere we use `(req: Request, res: Response)`,
    // TypeScript will know that `req.user` and `req.customer` are valid typed
    // properties. Because of that, we no longer need a separate
    // `interface CustomRequest extends Request { ... }`.
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
