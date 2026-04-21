import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { CartService } from "./service/cart.service";
import { sendSuccess, sendError } from "../../utils/reponse";
export class CartController {
  constructor(private readonly cartService: CartService) {}

  createCart = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.createCart(req.body);
    sendSuccess(res, "Cart created successfully", 201);
  });
}
