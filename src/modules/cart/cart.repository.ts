import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;
export class CartRepository {
  // إذا وصل tx استخدم tx
  // إذا ما وصل tx استخدم prisma العادي
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }

  async createCart(customerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).cart.create({
      data: {
        customerId,
      },
    });
  }

  async findCartByCustomerId(customerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).cart.findUnique({
      where: {
        customerId,
      },
    });
  }
  async findCartItem(
    cartId: number,
    menuItemId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId,
        },
      },
    });
  }

  async getMenuItemDetails(menuItemId: number, tx?: PrismaTransaction) {
    return await this.db(tx).menuItem.findUnique({
      where: {
        id: menuItemId,
      },
    });
  }

  async createCartItem(
    cartId: number,
    menuItemId: number,
    quantity: number,
    price: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.create({
      data: {
        cartId,
        menuItemId,
        quantity,
        price,
      },
    });
  }

  async updateCartItemQuantity(
    cartId: number,
    menuItemId: number,
    quantity: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.update({
      where: {
        cartId_menuItemId: {
          cartId: cartId,
          menuItemId: menuItemId,
        },
      },
      data: {
        quantity,
      },
    });
  }

  async increaseCartItemQuantity(
    cartId: number,
    menuItemId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.update({
      where: {
        cartId_menuItemId: {
          cartId: cartId,
          menuItemId: menuItemId,
        },
      },
      data: {
        quantity: {
          increment: 1,
        },
      },
    });
  }

  async decreaseCartItemQuantity(
    cartId: number,
    menuItemId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.update({
      where: {
        cartId_menuItemId: {
          cartId: cartId,
          menuItemId: menuItemId,
        },
      },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  async getCartDetails(customerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).cart.findFirst({
      where: {
        customerId,
      },
      include: {
        items: true,
      },
    });
  }
}
