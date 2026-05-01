import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "../../common/tdos";
import asyncHandler from "../../utils/asyncHandler";
import { AdjustCartItemQuantityDto, AddToCartDto } from "./cart.dto";

export class CartController {
  constructor(private cartService: CartService) {}

  createCart = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.body;

    const cart = await this.cartService.createCart(customerId);

    res
      .status(StatusCodes.CREATED)
      .json({ data: cart, message: "Cart created successfully" });
  });

  getMyCart = asyncHandler(async (req: CustomRequest, res: Response) => {
    const customerId = req.body.customerId;
    const cart = await this.cartService.getMyCart(customerId);

    res
      .status(StatusCodes.OK)
      .json({ message: "Cart fetched successfully", data: cart });
  });

  addItemToCart = asyncHandler(async (req: CustomRequest, res: Response) => {
    const dto: AddToCartDto = {
      customerId: req.body.customerId,
      menuItemId: req.body.menuItemId,
      quantity: req.body.quantity,
    };
    const cart = await this.cartService.addItemToCart(dto);

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Item added to cart successfully", data: cart });
  });

  updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const cart = await this.cartService.updateQuantity({
      customerId: req.body.customerId,
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
      const dto: AdjustCartItemQuantityDto = {
        customerId: req.body.customerId,
        menuItemId: Number(req.params.menuItemId),
      };

      const cart = await this.cartService.increaseCartItemQuantity(dto);

      res.status(StatusCodes.OK).json({
        message: "Cart item quantity increased successfully",
        data: cart,
      });
    },
  );

  decreaseCartItemQuantity = asyncHandler(
    async (req: Request, res: Response) => {
      const dto: AdjustCartItemQuantityDto = {
        customerId: req.body.customerId,
        menuItemId: Number(req.params.menuItemId),
      };

      const cart = await this.cartService.decreaseCartItemQuantity(dto);

      res.status(StatusCodes.OK).json({
        message: "Cart item quantity decreased successfully",
        data: cart,
      });
    },
  );

  async removeItemFromCart(req: Request, res: Response) {}

  async clearCart(req: Request, res: Response) {}

  async checkoutCart(req: Request, res: Response) {}
}
