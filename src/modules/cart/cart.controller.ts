import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import { ForbiddenError } from "../../errors";
import {
  AdjustCartItemQuantityDto,
  AddToCartDto,
  RemoveCartItemDto,
} from "./cart.dto";

export class CartController {
  constructor(private cartService: CartService) {}

  private getCustomerId(req: Request) {
    const customerId = req.customer?.id;

    if (!customerId) {
      throw new ForbiddenError("Customer authentication is required");
    }

    return customerId;
  }

  getMyCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const cart = await this.cartService.getMyCart(customerId);

    res
      .status(StatusCodes.OK)
      .json({ message: "Cart fetched successfully", data: cart });
  });

  addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const dto: AddToCartDto = {
      menuItemId: req.body.menuItemId,
      quantity: req.body.quantity,
    };
    const cart = await this.cartService.addItemToCart(customerId, dto);

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Item added to cart successfully", data: cart });
  });

  updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const cart = await this.cartService.updateQuantity(customerId, {
      menuItemId: Number(req.params.menuItemId),
      quantity: req.body.quantity,
    });
    res.status(StatusCodes.OK).json({
      message: "Cart item quantity updated successfully",
      data: cart,
    });
  });

  increaseCartItemQuantity = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const dto: AdjustCartItemQuantityDto = {
        menuItemId: Number(req.params.menuItemId),
      };

      const cart = await this.cartService.increaseCartItemQuantity(
        customerId,
        dto,
      );

      res.status(StatusCodes.OK).json({
        message: "Cart item quantity increased successfully",
        data: cart,
      });
    },
  );

  decreaseCartItemQuantity = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const dto: AdjustCartItemQuantityDto = {
        menuItemId: Number(req.params.menuItemId),
      };

      const cart = await this.cartService.decreaseCartItemQuantity(
        customerId,
        dto,
      );

      res.status(StatusCodes.OK).json({
        message: "Cart item quantity decreased successfully",
        data: cart,
      });
    },
  );

  removeItemFromCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const dto: RemoveCartItemDto = {
      menuItemId: Number(req.params.menuItemId),
    };

    const cart = await this.cartService.removeItemFromCart(customerId, dto);

    res.status(StatusCodes.OK).json({
      message: "Item removed from cart successfully",
      data: cart,
    });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const cart = await this.cartService.clearCart(customerId);

    res.status(StatusCodes.OK).json({
      message: "Cart cleared successfully",
      data: cart,
    });
  });

  async checkoutCart(req: Request, res: Response) {}
}
