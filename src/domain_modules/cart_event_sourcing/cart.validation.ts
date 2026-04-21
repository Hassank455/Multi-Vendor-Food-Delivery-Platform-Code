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

export function validateAddItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { productId, productName, unitPrice, quantity } = req.body;

  if (!productId || !productName) {
    return sendError(res, "productId and productName are required", 400);
  }

  if (typeof unitPrice !== "number" || typeof quantity !== "number") {
    return sendError(res, "unitPrice and quantity must be numbers", 400);
  }

  next();
}
