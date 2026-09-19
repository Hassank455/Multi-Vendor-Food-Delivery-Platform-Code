import { AppErrorImpl } from "./customApiError";
import { StatusCodes } from "http-status-codes";

export class UnAuthenticatedError extends AppErrorImpl {
  constructor(message: string) {
    super({ message, statusCode: StatusCodes.UNAUTHORIZED });
  }
}
