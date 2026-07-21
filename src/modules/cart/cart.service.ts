import { NotFoundError, BadRequestError } from "../../errors";
import prisma from "../../lib/prisma";
import { CartRepository } from "./cart.repository";
import {
  UpdateCartItemQuantityDto,
  AdjustCartItemQuantityDto,
  AddToCartDto,
  CartItemResponseDto,
  CartResponseDto,
  RemoveCartItemDto,
} from "./cart.dto";
import { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;
export class CartService {
  constructor(private cartRepository: CartRepository) {}

  private calculateSubTotal(
    items: Array<{ quantity: number; price: Prisma.Decimal }>,
  ): Prisma.Decimal {
    return items.reduce(
      (sum, item) => sum.plus(item.price.mul(item.quantity)),
      new Prisma.Decimal(0),
    );
  }

  private async syncCartSubTotal(customerId: number, tx: PrismaTransaction) {
    const cart = await this.cartRepository.getCartDetails(customerId, tx);

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const subTotal = this.calculateSubTotal(cart.items);
    // When the last item is removed, the cart should no longer point to a restaurant.
    const restaurantId =
      cart.items.length > 0
        ? (cart.restaurantId ?? cart.items[0].menuItem.restaurantId)
        : null;

    await this.cartRepository.updateCart(
      cart.id,
      {
        subTotal,
        restaurantId,
      },
      tx,
    );

    return {
      ...cart,
      subTotal,
      restaurantId,
    };
  }

  private formatCart(cart: any, customerId: number): CartResponseDto {
    if (!cart) {
      return {
        customerId,
        restaurantId: null,
        subTotal: 0,
        items: [],
      };
    }

    const items: CartItemResponseDto[] = cart.items.map((item: any) => ({
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: Number(item.price),
      totalPrice: Number(item.price.mul(item.quantity)),
      isAvailable: item.menuItem.isAvailable,
    }));

    return {
      id: cart.id,
      customerId: cart.customerId,
      restaurantId: cart.restaurantId ?? null,
      subTotal: Number(cart.subTotal),
      items,
    };
  }

  private async getExistingCartOrThrow(
    customerId: number,
    tx: PrismaTransaction,
  ) {
    const cart = await this.cartRepository.findCartByCustomerId(customerId, tx);

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    return cart;
  }

  private async getOrCreateCart(customerId: number, tx: PrismaTransaction) {
    const cart = await this.cartRepository.findCartByCustomerId(customerId, tx);

    if (cart) {
      return cart;
    }

    return this.cartRepository.createCart(customerId, tx);
  }

  private async getCartItemOrThrow(
    cartId: number,
    menuItemId: number,
    tx: PrismaTransaction,
  ) {
    const cartItem = await this.cartRepository.findCartItem(
      cartId,
      menuItemId,
      tx,
    );

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    return cartItem;
  }

  async getMyCart(customerId: number): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getCartDetails(customerId);
    return this.formatCart(cart, customerId);
  }

  async getMenuItemDetails(menuItemId: number, tx?: PrismaTransaction) {
    const menuItem = await this.cartRepository.getMenuItemDetails(
      menuItemId,
      tx,
    );
    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }
    return menuItem;
  }

  async addItemToCart(
    customerId: number,
    dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      // A cart is created lazily the first time the customer adds an item.
      const cart = await this.getOrCreateCart(customerId, tx);

      const menuItem = await this.getMenuItemDetails(dto.menuItemId, tx);
      if (!menuItem.isAvailable) {
        throw new BadRequestError("Product is not available for purchase");
      }

      if (
        cart.restaurantId !== null &&
        cart.restaurantId !== undefined &&
        cart.restaurantId !== menuItem.restaurantId
      ) {
        throw new BadRequestError(
          "Cart already contains items from another restaurant",
        );
      }

      if (cart.restaurantId == null) {
        await this.cartRepository.updateCart(
          cart.id,
          {
            restaurantId: menuItem.restaurantId,
          },
          tx,
        );
      }

      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (existingCartItem) {
        // Keep add-to-cart idempotent from the customer's point of view by stacking quantities.
        await this.cartRepository.updateCartItemQuantity(
          cart.id,
          dto.menuItemId,
          existingCartItem.quantity + dto.quantity,
          tx,
        );
      } else {
        // Price is snapshotted in the cart item so later menu price changes do not rewrite old cart rows.
        await this.cartRepository.createCartItem(
          cart.id,
          dto.menuItemId,
          dto.quantity,
          menuItem.price,
          tx,
        );
      }

      return await this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async updateQuantity(
    customerId: number,
    dto: UpdateCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      const cart = await this.getExistingCartOrThrow(customerId, tx);
      await this.getCartItemOrThrow(cart.id, dto.menuItemId, tx);

      // quantity = 0 behaves like remove, so clients do not need a separate flow.
      if (dto.quantity === 0) {
        await this.cartRepository.removeCartItem(cart.id, dto.menuItemId, tx);
      } else {
        await this.cartRepository.updateCartItemQuantity(
          cart.id,
          dto.menuItemId,
          dto.quantity,
          tx,
        );
      }

      return this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async increaseCartItemQuantity(
    customerId: number,
    dto: AdjustCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      const cart = await this.getExistingCartOrThrow(customerId, tx);
      await this.getCartItemOrThrow(cart.id, dto.menuItemId, tx);

      await this.cartRepository.increaseCartItemQuantity(
        cart.id,
        dto.menuItemId,
        tx,
      );

      return this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async decreaseCartItemQuantity(
    customerId: number,
    dto: AdjustCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      const cart = await this.getExistingCartOrThrow(customerId, tx);
      const existingCartItem = await this.getCartItemOrThrow(
        cart.id,
        dto.menuItemId,
        tx,
      );
      // Dropping from 1 to 0 removes the row instead of storing zero-quantity items.
      if (existingCartItem.quantity === 1) {
        await this.cartRepository.removeCartItem(cart.id, dto.menuItemId, tx);
      } else {
        await this.cartRepository.decreaseCartItemQuantity(
          cart.id,
          dto.menuItemId,
          tx,
        );
      }

      return this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async removeItemFromCart(customerId: number, dto: RemoveCartItemDto) {
    const cart = await prisma.$transaction(async (tx) => {
      const cart = await this.getExistingCartOrThrow(customerId, tx);
      await this.getCartItemOrThrow(cart.id, dto.menuItemId, tx);

      await this.cartRepository.removeCartItem(cart.id, dto.menuItemId, tx);

      return this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async clearCart(customerId: number) {
    const cart = await prisma.$transaction(async (tx) => {
      const cart = await this.getExistingCartOrThrow(customerId, tx);

      await this.cartRepository.clearCart(cart.id, tx);

      return this.syncCartSubTotal(customerId, tx);
    });

    return this.formatCart(cart, customerId);
  }

  async checkoutCart(cartId: number) {}
}
