import { AppErrorImpl } from "./customApiError";
import { StatusCodes } from "http-status-codes";

export class ForbiddenError extends AppErrorImpl {
  constructor(message: string) {
    super({ message, statusCode: StatusCodes.FORBIDDEN });
  }
}
