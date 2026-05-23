import { NotFoundError, BadRequestError } from "../../errors";
import { OrderRepo } from "./order.repo";
import {
  CartForCheckout,
  CreateOrderItemInput,
  CustomerOrderDetailsDto,
  CustomerOrderListItemDto,
  GetRestaurantOrdersQueryDto,
  PaginatedRestaurantOrdersDto,
  PlaceOrderDto,
  PreparedOrderItem,
  RestaurantOrderDetailsDto,
  RestaurantOrderListItemDto,
  UpdateRestaurantOrderStatusDto,
} from "./order.dto";
import { PaymentMethod, OrderStatus } from "../../generated/prisma/client";
import { CartRepository } from "../cart/cart.repository";
import prisma from "../../lib/prisma";
import { LoggerService } from "../../services/logger.service";
import type { Prisma } from "../../generated/prisma/client";
import { CustomerAddressRepo } from "../customer_address/customer_address.repo";
import { buildPaginationMeta } from "../../common/pagination";
const logger = new LoggerService("order");
type PrismaTransaction = Prisma.TransactionClient;
export class OrderService {
  constructor(
    private orderRepo: OrderRepo,
    private cartRepo: CartRepository,
    private customerAddressRepo: CustomerAddressRepo,
  ) {}

  // ============== PLACE ORDER =====================
  async placeOrder(customerId: number, dto: PlaceOrderDto) {
    const order = await prisma.$transaction(async (tx) => {
      //TODO: Lock Cart

      const cart = (await this.cartRepo.getCartDetails(
        customerId,
        tx,
      )) as CartForCheckout | null;
      logger.info("Cart ", { cart });

      this.ensureCartExists(cart);
      this.validateCartItemsAvailability(cart);
      if (cart.restaurantId == null) {
        throw new BadRequestError("Cart restaurant is not set");
      }

      const restaurantId = cart.restaurantId;

      await this.validateCustomerAddressOwnership(
        customerId,
        dto.customerAddressId,
        tx,
      );

      //TODO: Validate Inventory / Stock

      const orderItems = this.buildOrderItems(cart);
      const orderItemsData: CreateOrderItemInput[] = orderItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.unitPrice,
      }));

      const createdOrder = await this.orderRepo.createOrder(
        customerId,
        dto.customerAddressId,
        restaurantId,
        dto.paymentMethod,
        Number(cart.subTotal),
        tx,
      );

      await this.orderRepo.createOrderItems(
        createdOrder.id,
        orderItemsData,
        tx,
      );

      //TODO: Update Inventory -> Decrease stock quantities

      await this.orderRepo.createTransaction(
        createdOrder.id,
        Number(cart.subTotal),
        dto.paymentMethod,
        dto.paymentMethod === PaymentMethod.CASH
          ? "Cash payment on delivery"
          : "Card payment initiated",
        tx,
      );

      await this.cartRepo.clearCart(cart.id, tx);

      // TODO: Unlock Cart

      return createdOrder;
    });

    return order;
  }

  private ensureCartExists(
    cart: CartForCheckout | null,
  ): asserts cart is CartForCheckout {
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    if (!cart.items.length) {
      throw new BadRequestError("Cart is empty");
    }
  }

  private validateCartItemsAvailability(cart: CartForCheckout) {
    for (const item of cart.items) {
      if (!item.menuItem) {
        throw new NotFoundError(
          `Menu item with id ${item.menuItemId} not found`,
        );
      }

      if (!item.menuItem.isAvailable) {
        throw new BadRequestError(
          `Menu item "${item.menuItem.name}" is not available`,
        );
      }

      if (item.quantity <= 0) {
        throw new BadRequestError(
          `Invalid quantity for menu item "${item.menuItem.name}"`,
        );
      }
    }
  }

  private async validateCustomerAddressOwnership(
    customerId: number,
    customerAddressId: number,
    tx: PrismaTransaction,
  ) {
    const customerAddress = await this.customerAddressRepo.getCustomerAddress(
      customerId,
      customerAddressId,
      tx,
    );

    if (!customerAddress) {
      throw new NotFoundError("Customer address not found");
    }

    return customerAddress;
  }

  private buildOrderItems(cart: CartForCheckout): PreparedOrderItem[] {
    return cart.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.quantity * item.price,
    }));
  }

  // ============== GET CUSTOMER ORDERS =====================
  async getCustomerOrders(
    customerId: number,
  ): Promise<CustomerOrderListItemDto[]> {
    const orders = await this.orderRepo.getCustomerOrders(customerId);
    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
      restaurant: {
        id: order.restaurant.id,
        name: order.restaurant.name,
      },
      // items: order.items.map((item) => ({
      //   menuItemId: item.menuItemId,
      //   name: item.menuItem.name,
      //   quantity: item.quantity,
      //   unitPrice: Number(item.price),
      //   totalPrice: item.quantity * Number(item.price),
      // })),
      items: order.items.map((item) => this.mapPreparedOrderItem(item)),
    }));
  }

  // ============== GET CUSTOMER ORDER BY ID =====================
  async getCustomerOrderById(
    customerId: number,
    orderId: number,
  ): Promise<CustomerOrderDetailsDto> {
    return await this.getCustomerOrderDetailsOrThrow(customerId, orderId);
  }

  // ============== CANCEL ORDER =====================
  async cancelCustomerOrder(
    customerId: number,
    orderId: number,
  ): Promise<CustomerOrderDetailsDto> {
    const order = await this.orderRepo.findCustomerOrderStatus(
      customerId,
      orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    this.ensureCustomerCanCancelOrder(order.status);

    // we use tx to These processes share a single logic and must succeed or fail as a single unit.
    // If the order status update succeeds but fetching the updated order details fails, the customer would get an error response without the order being cancelled, which is not a good user experience.
    return await prisma.$transaction(async (tx) => {
      const result = await this.orderRepo.cancelCustomerOrder(
        customerId,
        orderId,
        tx,
      );

      if (result.count === 0) {
        throw new BadRequestError(
          "Order status changed before cancellation. Please refresh and try again",
        );
      }

      logger.info("Order cancelled", {
        customerId,
        orderId,
      });

      return await this.getCustomerOrderDetailsOrThrow(customerId, orderId, tx);
    });
  }

  private mapPreparedOrderItem(item: {
    menuItemId: number;
    quantity: number;
    price: number;
    menuItem: {
      name: string;
    };
  }): PreparedOrderItem {
    return {
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: Number(item.price),
      totalPrice: item.quantity * Number(item.price),
    };
  }

  private ensureCustomerCanCancelOrder(status: OrderStatus) {
    if (status === OrderStatus.CANCELLED) {
      throw new BadRequestError("Order is already cancelled");
    }

    if (status === OrderStatus.DELIVERED) {
      throw new BadRequestError("Delivered order cannot be cancelled");
    }

    if (status !== OrderStatus.PENDING && status !== OrderStatus.CONFIRMED) {
      throw new BadRequestError(
        "Order cannot be cancelled after preparation has started",
      );
    }
  }
  private async getCustomerOrderDetailsOrThrow(
    customerId: number,
    orderId: number,
    tx?: PrismaTransaction,
  ): Promise<CustomerOrderDetailsDto> {
    const order = await this.orderRepo.getCustomerOrderById(
      customerId,
      orderId,
      tx,
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
      restaurant: {
        id: order.restaurant.id,
        name: order.restaurant.name,
      },
      customerAddress: {
        id: order.customerAddress.id,
        street: order.customerAddress.street,
        city: order.customerAddress.city,
        buildingNo: order.customerAddress.buildingNo ?? "",
        postalCode: order.customerAddress.postalCode ?? "",
        governorate: order.customerAddress.governorate,
      },
      items: order.items.map((item) => this.mapPreparedOrderItem(item)),
      transactions: order.transactions.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        method: transaction.method,
        details: transaction.details,
        createdAt: transaction.createdAt,
      })),
    };
  }

  // ============== GET RESTAURANT ORDERS =====================
  async getRestaurantOrders(
    ownerId: number,
    query: GetRestaurantOrdersQueryDto,
  ): Promise<PaginatedRestaurantOrdersDto> {
    const restaurant = await this.getRestaurantByOwnerIdOrThrow(ownerId);
    const { orders, total } = await this.orderRepo.getRestaurantOrders(
      restaurant.id,
      query,
    );

    return {
      data: orders.map((order) => ({
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalPrice: Number(order.totalPrice),
        createdAt: order.createdAt,
        customer: {
          id: order.customer?.id ?? 0,
          name: order.customer?.name ?? "Unknown Customer",
          phone: order.customer?.phone ?? "",
        },
        items: order.items.map((item) => this.mapPreparedOrderItem(item)),
      })),
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  // ============== GET RESTAURANT ORDER DETAILS =====================
  async getRestaurantOrderDetails(
    ownerId: number,
    orderId: number,
  ): Promise<RestaurantOrderDetailsDto> {
    const restaurant = await this.getRestaurantByOwnerIdOrThrow(ownerId);
    const order = await this.orderRepo.getRestaurantOrderDetails(
      restaurant.id,
      orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
      customer: {
        id: order.customer?.id ?? 0,
        name: order.customer?.name ?? "Unknown Customer",
        phone: order.customer?.phone ?? "",
        email: order.customer?.email ?? "",
      },
      customerAddress: {
        id: order.customerAddress.id,
        street: order.customerAddress.street,
        city: order.customerAddress.city,
        buildingNo: order.customerAddress.buildingNo ?? "",
        postalCode: order.customerAddress.postalCode ?? "",
        governorate: order.customerAddress.governorate,
      },
      items: order.items.map((item) => this.mapPreparedOrderItem(item)),
      transactions: order.transactions.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        method: transaction.method,
        details: transaction.details,
        createdAt: transaction.createdAt,
      })),
    };
  }

  async updateOrderStatus(
    ownerId: number,
    orderId: number,
    dto: UpdateRestaurantOrderStatusDto,
  ): Promise<RestaurantOrderDetailsDto> {
    const restaurant = await this.getRestaurantByOwnerIdOrThrow(ownerId);
    const order = await this.orderRepo.findRestaurantOrderStatus(
      restaurant.id,
      orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    this.ensureRestaurantCanUpdateOrderStatus(order.status, dto.status);

    return await prisma.$transaction(async (tx) => {
      const result = await this.orderRepo.updateRestaurantOrderStatus(
        restaurant.id,
        orderId,
        order.status,
        dto.status,
        tx,
      );

      if (result.count === 0) {
        throw new BadRequestError(
          "Order status changed before update. Please refresh and try again",
        );
      }

      logger.info("Order status updated", {
        ownerId,
        orderId,
        fromStatus: order.status,
        toStatus: dto.status,
      });

      const updatedOrder = await this.orderRepo.getRestaurantOrderDetails(
        restaurant.id,
        orderId,
        tx,
      );

      if (!updatedOrder) {
        throw new NotFoundError("Order not found");
      }

      return {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentMethod: updatedOrder.paymentMethod,
        totalPrice: Number(updatedOrder.totalPrice),
        createdAt: updatedOrder.createdAt,
        customer: {
          id: updatedOrder.customer?.id ?? 0,
          name: updatedOrder.customer?.name ?? "Unknown Customer",
          phone: updatedOrder.customer?.phone ?? "",
          email: updatedOrder.customer?.email ?? "",
        },
        customerAddress: {
          id: updatedOrder.customerAddress.id,
          street: updatedOrder.customerAddress.street,
          city: updatedOrder.customerAddress.city,
          buildingNo: updatedOrder.customerAddress.buildingNo ?? "",
          postalCode: updatedOrder.customerAddress.postalCode ?? "",
          governorate: updatedOrder.customerAddress.governorate,
        },
        items: updatedOrder.items.map((item) => this.mapPreparedOrderItem(item)),
        transactions: updatedOrder.transactions.map((transaction) => ({
          id: transaction.id,
          amount: Number(transaction.amount),
          method: transaction.method,
          details: transaction.details,
          createdAt: transaction.createdAt,
        })),
      };
    });
  }

  private async getRestaurantByOwnerIdOrThrow(
    ownerId: number,
    tx?: PrismaTransaction,
  ) {
    const restaurant = await this.orderRepo.findRestaurantByOwnerId(
      ownerId,
      tx,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found for this user");
    }

    return restaurant;
  }

  private ensureRestaurantCanUpdateOrderStatus(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    if (currentStatus === nextStatus) {
      throw new BadRequestError("Order is already in this status");
    }

    if (currentStatus === OrderStatus.CANCELLED) {
      throw new BadRequestError("Cancelled order cannot be updated");
    }

    if (currentStatus === OrderStatus.DELIVERED) {
      throw new BadRequestError("Delivered order cannot be updated");
    }

    const allowedNextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PREPARING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
    };

    const validNextStatuses = allowedNextStatuses[currentStatus] ?? [];
    if (!validNextStatuses.includes(nextStatus)) {
      throw new BadRequestError(
        `Cannot update order status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }
}
