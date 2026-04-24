import { Request, Response } from "express";
import { CartService } from "./cart.service";

export class CartController {
  constructor(private cartService: CartService) {}

  async createCart(req: Request, res: Response) {
    const { customerId } = req.body;
    const cart = await this.cartService.createCart(customerId);
  }

  async getCartByCustomerId(req: Request, res: Response) {}

  async addItemToCart(req: Request, res: Response) {
    /**
     * Ensure that the user is authenticated
     * Create zod schema for the required fields in the req.body
     * Call the cartService.addItemToCart method with the appropriate parameters
     * Handle the response and send back the appropriate status code and message
    */
  }

  async removeItemFromCart(req: Request, res: Response) {}

  async clearCart(req: Request, res: Response) {}

  async checkoutCart(req: Request, res: Response) {}
}
