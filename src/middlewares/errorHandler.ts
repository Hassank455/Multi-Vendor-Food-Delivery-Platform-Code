import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const defaultError = {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong, try again later",
  };
  if (err.code === "P2025") {
    defaultError.statusCode = 404;
    defaultError.message = `${err.meta.modelName} not found!`;
  }

  if (err.code === "P2002") {
    defaultError.statusCode = 400;
    defaultError.message = `The fields (${err.meta.target.join(" ")}) must be unique`;
  }
  res.status(defaultError.statusCode).json({
    message: defaultError.message,
  });
};
