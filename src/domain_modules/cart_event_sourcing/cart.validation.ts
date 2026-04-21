import type { NextFunction, Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/reponse";

export function validateCreateCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { cartId, userId, currency } = req.body;

  if (!cartId || !userId || !currency) {
    return sendError(res, "cartId, userId, and currency are required", 400);
  }

  next();
}
