import { AppError } from "./error";

declare global {
  namespace Express {
    interface Request {
      error?: AppError;
      user?: {
        id: number;
      };
      customer?: {
        id: number;
      };
    }
  }
}
