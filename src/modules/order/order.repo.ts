import prisma from "../../lib/prisma";
import type {
  Prisma,
  PaymentMethod,
} from "../../generated/prisma/client";
import type { CreateOrderItemInput } from "./order.dto";

type PrismaTransaction = Prisma.TransactionClient;

export class OrderRepo {
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }
  async createOrder(
    customerId: number,
    addressId: number,
    restaurantId: number,
    paymentMethod: PaymentMethod,
    totalPrice: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.create({
      data: {
        customerId: customerId,
        addressId: addressId,
        restaurantId: restaurantId,
        paymentMethod: paymentMethod,
        totalPrice: totalPrice,
      },
    });
  }

  async createOrderItems(
    orderId: number,
    items: CreateOrderItemInput[],
    tx?: PrismaTransaction,
  ) {
    const orderItemsData = items.map((item) => ({
      orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    }));
    await this.db(tx).orderItem.createMany({
      data: orderItemsData,
    });
  }

  async createTransaction(
    orderId: number,
    amount: number,
    method: PaymentMethod,
    details?: string,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).transaction.create({
      data: {
        orderId: orderId,
        amount: amount,
        method: method,
        details: details,
      },
    });
  }
}
