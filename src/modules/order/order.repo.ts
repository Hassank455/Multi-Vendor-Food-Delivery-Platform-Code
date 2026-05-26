import prisma from "../../lib/prisma";
import {
  OrderStatus,
  type Prisma,
  type PaymentMethod,
} from "../../generated/prisma/client";
import type {
  CreateOrderItemInput,
  GetCustomerOrdersQueryDto,
  GetRestaurantOrdersQueryDto,
} from "./order.dto";

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

  async getCustomerOrders(
    customerId: number,
    query: GetCustomerOrdersQueryDto,
    tx?: PrismaTransaction,
  ) {
    const where: Prisma.OrderWhereInput = {
      customerId,
      ...(query.status && { status: query.status }),
    };

    const skip = (query.page - 1) * query.limit;

    const countQuery = this.db(tx).order.count({
      where,
    });
    const ordersQuery = this.db(tx).order.findMany({
      where,
      skip,
      take: query.limit,
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

    const [total, orders] = tx
      ? await Promise.all([countQuery, ordersQuery])
      : await prisma.$transaction([countQuery, ordersQuery]);

    return {
      total,
      orders,
    };
  }

  async getCustomerOrderById(
    customerId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.findFirst({
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

  async findCustomerOrderStatus(
    customerId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async cancelCustomerOrder(
    customerId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.updateMany({
      where: {
        id: orderId,
        customerId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
        },
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }

  async findRestaurantByOwnerId(ownerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).restaurant.findFirst({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getRestaurantOrders(
    restaurantId: number,
    query: GetRestaurantOrdersQueryDto,
    tx?: PrismaTransaction,
  ) {
    // this is mean always to filter by restaurantId and if status is provided then also filter by status
    const where: Prisma.OrderWhereInput = {
      restaurantId,
      ...(query.status && { status: query.status }),
    };
    // for pagination we will use skip and take, skip is the number of items to skip and take is the number of items to take
    const skip = (query.page - 1) * query.limit;

    // count the total number of orders that match the where condition
    const countQuery = this.db(tx).order.count({
      where,
    });
    // then get the orders in the current page
    const ordersQuery = this.db(tx).order.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
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

    const [total, orders] = tx
      ? await Promise.all([countQuery, ordersQuery])
      : await prisma.$transaction([countQuery, ordersQuery]);

    return {
      total,
      orders,
    };
  }

  async getRestaurantOrderDetails(
    restaurantId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
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

  async findRestaurantOrderStatus(
    restaurantId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async updateRestaurantOrderStatus(
    restaurantId: number,
    orderId: number,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.updateMany({
      where: {
        id: orderId,
        restaurantId,
        status: currentStatus,
      },
      data: {
        status: nextStatus,
      },
    });
  }

  async getCustomerOrderStatus(
    customerId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }
}
