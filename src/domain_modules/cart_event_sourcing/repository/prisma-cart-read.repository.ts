import { randomUUID } from "node:crypto";
import { Prisma } from "../../../generated/prisma/client";
import type { PrismaClient } from "../../../generated/prisma/client";
import { mapCartReadModelToRecord } from "../persistence/cart.persistence";
import type {
  CartReadModelRecord,
  CartReadRepository,
} from "./cart.read.repository";

export class PrismaCartReadRepository implements CartReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(cart: CartReadModelRecord): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.cartReadModel.upsert({
        where: { cartId: cart.cartId },
        create: {
          cartId: cart.cartId,
          userId: cart.userId,
          currency: cart.currency,
          status: cart.status,
          totalQuantity: cart.totalQuantity,
          totalPrice: cart.totalPrice,
          version: cart.version,
        },
        update: {
          userId: cart.userId,
          currency: cart.currency,
          status: cart.status,
          totalQuantity: cart.totalQuantity,
          totalPrice: cart.totalPrice,
          version: cart.version,
        },
      });

      await tx.cartItemReadModel.deleteMany({
        where: { cartId: cart.cartId },
      });

      if (cart.items.length > 0) {
        await tx.cartItemReadModel.createMany({
          data: cart.items.map((item) => ({
            id: randomUUID(),
            cartId: cart.cartId,
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        });
      }
    });
  }

  async findById(cartId: string): Promise<CartReadModelRecord | null> {
    const cart = await this.prisma.cartReadModel.findUnique({
      where: { cartId },
      include: { items: true },
    });

    return cart ? mapCartReadModelToRecord(cart) : null;
  }
}
