import { NotFoundError } from "../../errors";
import prisma from "../../lib/prisma";
import { CartRepository } from "./cart.repository";

export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async createCart(customerId: number) {
    // Check if the customer is existing
  }

  async getCartByCustomerId(customerId: number) {}

  async addItemToCart(
    customerId: number,
    cartId: number,
    productId: number,
    quantity: number,
  ) {
    const result = await prisma.$transaction(async tx => {
      // Check if the cart exists
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== customerId) {
        // throw 403 error;
      }
      // Create a new cart if there is no cart for the customer
    });
  }

  async removeItemFromCart(cartId: number, productId: number) {}

  async clearCart(cartId: number) {}

  async checkoutCart(cartId: number) {}
}
