import prisma from "../../lib/prisma";
import type { Prisma, PaymentMethod } from "../../generated/prisma/client";
import type { CreateOrderItemInput } from "./order.dto";

type PrismaTransaction = Prisma.TransactionClient;

export class OrderRepo {
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }
  async createOrder(
    customerId: number,
    customerAddressId: number,
    restaurantId: number,
    paymentMethod: PaymentMethod,
    totalPrice: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.create({
      data: {
        customer: {
          connect: {
            id: customerId,
          },
        },
        customerAddress: {
          connect: {
            id: customerAddressId,
          },
        },
        restaurant: {
          connect: {
            id: restaurantId,
          },
        },
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

  async getCustomerOrders(customerId: number) {
    return await this.db().order.findMany({
      where: {
        customerId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getCustomerOrderById(customerId: number, orderId: number) {
    return await this.db().order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        customerAddress: {
          select: {
            id: true,
            street: true,
            city: true,
            buildingNo: true,
            postalCode: true,
            governorate: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            method: true,
            details: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }
}
