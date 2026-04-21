import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  // DATA IS OPTIONAL MUST ADD AS LAST PARAMETER
  message = 'Success',
  statusCode = 200,
  data?: unknown,
) => {
  res.status(statusCode).json({ status: 'success', message, data });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode= 400,
  errors?: unknown,
) => {
  res.status(statusCode).json({ statusCode, status: 'error', message, errors });
};