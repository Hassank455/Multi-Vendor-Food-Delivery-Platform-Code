import { AppErrorImpl } from "./customApiError";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends AppErrorImpl {
  constructor(message: string) {
    super({ message, statusCode: StatusCodes.BAD_REQUEST });
  }
}
