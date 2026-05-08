import { NotFoundError, BadRequestError, ForbiddenError } from "../../errors";
import { OrderRepo } from "./order.repo";
import {
  CartForCheckout,
  CreateOrderItemInput,
  PlaceOrderDto,
  PreparedOrderItem,
} from "./order.dto";
import { PaymentMethod } from "../../generated/prisma/client";
import { CartRepository } from "../cart/cart.repository";
import prisma from "../../lib/prisma";
import { LoggerService } from "../../services/logger.service";
import type { Prisma } from "../../generated/prisma/client";

const logger = new LoggerService("order");
type PrismaTransaction = Prisma.TransactionClient;
export class OrderService {
  constructor(
    private orderRepo: OrderRepo,
    private cartRepo: CartRepository,
  ) {}

  // ============== PLACE ORDER =====================
  async placeOrder(dto: PlaceOrderDto) {
    const order = await prisma.$transaction(async (tx) => {
      //TODO: Lock Cart

      const cart = (await this.cartRepo.getCartDetails(
        dto.customerId,
        tx,
      )) as CartForCheckout | null;
      logger.info("Cart ", { cart });

      this.ensureCartExists(cart);
      this.validateCartItemsAvailability(cart);
      if (cart.restaurantId == null) {
        throw new BadRequestError("Cart restaurant is not set");
      }

      const restaurantId = cart.restaurantId;

      //TODO: ADDRESS VALIDATION
      // await this.validateAddressOwnership(dto.customerId, dto.addressId, tx);

      //TODO: Validate Inventory / Stock
      const orderItems = this.buildOrderItems(cart);
      const orderItemsData: CreateOrderItemInput[] = orderItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.unitPrice,
      }));

      const createdOrder = await this.orderRepo.createOrder(
        dto.customerId,
        dto.addressId,
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

  // private async validateAddressOwnership(
  //   customerId: number,
  //   addressId: number,
  //   tx: PrismaTransaction,
  // ) {
  //   const address = await this.addressService.getAddressByCustomerId(
  //     customerId,
  //     addressId,
  //   );

  //   if (!address) {
  //     throw new NotFoundError("Address not found");
  //   }

  //   if (address.customerId !== customerId) {
  //     throw new ForbiddenError("Address does not belong to this customer");
  //   }

  //   return address;
  // }

  private buildOrderItems(cart: CartForCheckout): PreparedOrderItem[] {
    return cart.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.quantity * item.price,
    }));
  }
}
