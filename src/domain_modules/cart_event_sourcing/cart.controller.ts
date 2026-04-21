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

  // write with asyncHandler
  addItem = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.addItem({
      cartId: String(req.params.cartId),
      ...req.body,
    });
    sendSuccess(res, "Item added successfully");
  });

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await this.cartService.getCart(String(req.params.cartId));

    if (!cart) {
      return sendError(res, "Cart not found", 404);
    }

    return sendSuccess(res, "Cart retrieved successfully", 200, cart);
  });

  getCartEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await this.cartService.getCartEvents(
      String(req.params.cartId),
    );
    return sendSuccess(res, "Cart events retrieved successfully", 200, events);
  });

  increaseQuantity = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.increaseQuantity({
      cartId: String(req.params.cartId),
      productId: String(req.params.productId),
      amount: req.body.amount,
    });
    return sendSuccess(res, "Quantity increased successfully");
  });

  decreaseQuantity = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.decreaseQuantity({
      cartId: String(req.params.cartId),
      productId: String(req.params.productId),
      amount: req.body.amount,
    });
    return sendSuccess(res, "Quantity decreased successfully");
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.removeItem({
      cartId: String(req.params.cartId),
      productId: String(req.params.productId),
    });
    return sendSuccess(res, "Item removed successfully");
  });

  resetCart = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.resetCart({
      cartId: String(req.params.cartId),
    });
    return sendSuccess(res, "Cart reset successfully");
  });

  checkout = asyncHandler(async (req: Request, res: Response) => {
    await this.cartService.checkout({
      cartId: String(req.params.cartId),
    });
    return sendSuccess(res, "Cart checked out successfully");
  });
}
