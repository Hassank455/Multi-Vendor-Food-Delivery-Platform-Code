import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const defaultError = {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong, try again later",
    errors: err.errors || undefined,
  };
  if (err.code === "P2025") {
    defaultError.statusCode = 404;
    defaultError.message = err.meta?.modelName
      ? `${err.meta.modelName} not found!`
      : "Resource not found!";
  }

  if (err.code === "P2002") {
    defaultError.statusCode = 400;
    const targetFields = Array.isArray(err.meta?.target)
      ? err.meta.target.join(" ")
      : null;
    defaultError.message = targetFields
      ? `The fields (${targetFields}) must be unique`
      : "The provided fields must be unique";
  }

  // Handle foreign key constraint violation (e.g., when a related resource is not found)
  // Foreign key constraint failed
  // كان customerId=99999 غير موجود في جدول Customer، فقاعدة البيانات سترفض الإدخال، وPrisma سترمي P2003.
  if (err.code === "P2003") {
    defaultError.statusCode = 400;
    defaultError.message = "Invalid reference to a related resource";
  }

  res.status(defaultError.statusCode).json({
    message: defaultError.message,
    errors: defaultError.errors,
  });
};
