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
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                isAvailable: true,
                restaurantId: true,
              },
            },
          },
        },
      },
    });
  }

  async updateCart(
    cartId: number,
    data: { subTotal?: number; restaurantId?: number | null },
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cart.update({
      where: {
        id: cartId,
      },
      data,
    });
  }

  async removeCartItem(
    cartId: number,
    menuItemId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).cartItem.delete({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId,
        },
      },
    });
  }

  async clearCart(cartId: number, tx?: PrismaTransaction) {
    await this.db(tx).cartItem.deleteMany({
      where: {
        cartId,
      },
    });

    return await this.db(tx).cart.update({
      where: {
        id: cartId,
      },
      data: {
        subTotal: 0,
        restaurantId: null,
      },
    });
  }
}
