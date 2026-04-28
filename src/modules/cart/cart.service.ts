import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors";
import prisma from "../../lib/prisma";
import { CartRepository } from "./cart.repository";
import { UpdateCartItemQuantityDto } from "./cart.dto";

export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async createCart(customerId: number) {
    let cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      cart = await this.cartRepository.createCart(customerId);
    }
    return cart;
  }

  async getCartByCustomerId(customerId: number) {
    let cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      cart = await this.createCart(customerId);
    }
    return cart;
  }

  async addItemToCart(customerId: number, menuItemId: number) {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      const cart = await this.getCartByCustomerId(customerId);

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // check if the product exists
      const menuItem = await tx.menuItem.findUnique({
        where: {
          id: menuItemId,
        },
      });
      if (!menuItem) {
        throw new NotFoundError("Product not found");
      }
      if (!menuItem.isAvailable) {
        throw new BadRequestError("Product is not available for purchase");
      }

      // check if the item already exists in the cart
      const cartItem = await tx.cartItem.findUnique({
        where: {
          cartId_menuItemId: {
            cartId: cart.id,
            menuItemId: menuItem.id,
          },
        },
      });
      if (cartItem) {
        // If the item already exists, update the quantity
        await tx.cartItem.update({
          where: {
            id: cartItem.id,
          },
          data: {
            quantity: cartItem.quantity + 1,
          },
        });
      } else {
        // If the item does not exist, add it to the cart
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            menuItemId: menuItem.id,
            quantity: 1,
            price: menuItem.price,
          },
        });
      }

      // Return the updated cart with the new item added
      return await tx.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    });

    return cart;
  }

  async updateQuantity(dto: UpdateCartItemQuantityDto) {
    return prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // ensure that the item is exists in the cart
      const existingItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (!existingItem) {
        throw new Error("Product not found in cart");
      }

      if (dto.quantity === 0) {
        //TODO: we can remove the item from the cart if the quantity is 0, but for now we will just update the quantity to 0
      } else {
        await this.cartRepository.updateCartItemQuantity(
          cart.id,
          dto.menuItemId,
          dto.quantity,
          tx,
        );
      }

      // Return the updated cart with the new item added
      return this.cartRepository.getCartDetails(dto.customerId, tx);
    });
  }

  async removeItemFromCart(cartId: number, menuItemId: number) {}

  async clearCart(cartId: number) {}

  async checkoutCart(cartId: number) {}
}
