import { AppError } from "../types/error";

export class AppErrorImpl extends Error implements AppError {
  statusCode: number;
  code?: string;
  meta?: unknown;
  errors?: { [key: string]: string };
  isOperational: boolean;

  constructor({
    message,
    statusCode = 500,
    code,
    meta,
    errors,
    isOperational = true,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    meta?: unknown;
    errors?: { [key: string]: string };
    isOperational?: boolean;
  }) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
