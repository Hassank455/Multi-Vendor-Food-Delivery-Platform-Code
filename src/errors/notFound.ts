import { AppErrorImpl } from "./customApiError";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends AppErrorImpl {
  constructor(message: string) {
    super({ message, statusCode: StatusCodes.NOT_FOUND });
  }
}
