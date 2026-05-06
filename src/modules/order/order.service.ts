import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors";
import { OrderRepo } from "./order.repo";
import { PlaceOrderDto } from "./order.dto";
import { PaymentMethod } from "../../generated/prisma/client";
import { CartRepository } from "../cart/cart.repository";
import prisma from "../../lib/prisma";

import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export class OrderService {
  constructor(
    private orderRepo: OrderRepo,
    private cartRepo: CartRepository,
  ) {}

  // ============== PLACE ORDER =====================
  async placeOrder(dto: PlaceOrderDto) {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await this.cartRepo.findCartByCustomerId(dto.customerId, tx);

      this.ensureCartExists(cart);
      this.validateCartItemsAvailability(cart);

      // const restaurantId = this.extractRestaurantId(cart);

      await this.validateAddressOwnership(dto.customerId, dto.addressId, tx);
      // const discount = await this.validateDiscountCode(
      //   dto.discountCode,
      //   restaurantId,
      //   tx,
      // );

      const orderItems = this.buildOrderItems(cart);

      // const createdOrder = await this.orderRepo.createOrder(
      //   {
      //     customerId: dto.customerId,
      //     addressId: dto.addressId,
      //     restaurantId,
      //     paymentMethod: dto.paymentMethod,
      //     totalPrice: subTotal,
      //   },
      //   tx,
      // );
    });
  }

  private ensureCartExists(cart: any) {
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    if (!cart.items.length) {
      throw new BadRequestError("Cart is empty");
    }
  }
  private validateCartItemsAvailability(cart: any) {
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

  private async validateAddressOwnership(
    customerId: number,
    addressId: number,
    tx: PrismaTransaction,
  ) {
    const address = await this.orderRepo.findAddressById(addressId, tx);

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.customerId !== customerId) {
      throw new ForbiddenError("Address does not belong to this customer");
    }

    return address;
  }
  private buildOrderItems(cart: any) {
    return cart.items.map((item: any) => ({
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      totalPrice: item.quantity * item.menuItem.price,
    }));
  }
}
