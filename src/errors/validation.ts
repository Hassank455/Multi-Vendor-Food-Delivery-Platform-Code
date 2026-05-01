import { AppErrorImpl } from "./customApiError";
import { StatusCodes } from "http-status-codes";

export class ValidationError extends AppErrorImpl {
  constructor(message: string, errors: { [key: string]: string }) {
    super({ message, errors, statusCode: StatusCodes.BAD_REQUEST });
  }
}
