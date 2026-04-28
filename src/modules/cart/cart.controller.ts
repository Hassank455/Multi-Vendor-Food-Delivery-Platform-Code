import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "../../common/tdos";
import asyncHandler from "../../utils/asyncHandler";
import {
  UpdateCartItemQuantityDto,
  AdjustCartItemQuantityDto,
} from "./cart.dto";

export class CartController {
  constructor(private cartService: CartService) {
    this.createCart = this.createCart.bind(this);
    this.getCartByCustomerId = this.getCartByCustomerId.bind(this);
    this.addItemToCart = this.addItemToCart.bind(this);
    this.updateCartItemQuantity = this.updateCartItemQuantity.bind(this);
  }

  async createCart(req: Request, res: Response) {
    const { customerId } = req.body;

    const cart = await this.cartService.createCart(customerId);

    res
      .status(StatusCodes.CREATED)
      .json({ data: cart, message: "Cart created successfully" });
  }

  async getCartByCustomerId(req: CustomRequest, res: Response) {
    const cart = await this.cartService.getCartByCustomerId(req.customer!.id);

    res.json({ data: cart });
  }

  async addItemToCart(req: CustomRequest, res: Response) {
    /**
     * Ensure that the user is authenticated
     * Create zod schema for the required fields in the req.body
     * Call the cartService.addItemToCart method with the appropriate parameters
     * Handle the response and send back the appropriate status code and message
     */
    const cart = await this.cartService.addItemToCart(
      req.customer!.id,
      req.body.menuItemId,
    );

    res.json({ data: cart, message: "Item added to cart successfully" });
  }

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

      res.status(200).json({
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

      res.status(200).json({
        message: "Cart item quantity decreased successfully",
        data: cart,
      });
    },
  );

  async removeItemFromCart(req: Request, res: Response) {}

  async clearCart(req: Request, res: Response) {}

  async checkoutCart(req: Request, res: Response) {}
}
