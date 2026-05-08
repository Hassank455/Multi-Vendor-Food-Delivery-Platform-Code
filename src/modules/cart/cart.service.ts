import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors";
import prisma from "../../lib/prisma";
import { CartRepository } from "./cart.repository";
import {
  UpdateCartItemQuantityDto,
  AdjustCartItemQuantityDto,
  AddToCartDto,
  CartItemResponseDto,
  CartResponseDto,
  RemoveCartItemDto,
  ClearCartDto,
} from "./cart.dto";
import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;
export class CartService {
  constructor(private cartRepository: CartRepository) {}

  private calculateSubTotal(items: Array<{ quantity: number; price: number }>) {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  private async syncCartSubTotal(customerId: number, tx: PrismaTransaction) {
    const cart = await this.cartRepository.getCartDetails(customerId, tx);

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const subTotal = this.calculateSubTotal(cart.items);
    const restaurantId =
      cart.items.length > 0 ? (cart.restaurantId ?? cart.items[0].menuItem.restaurantId) : null;

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
      unitPrice: item.price,
      totalPrice: item.quantity * item.price,
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

  async createCart(customerId: number): Promise<CartResponseDto> {
    let cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      cart = await this.cartRepository.createCart(customerId);
    }

    const cartDetails = await this.cartRepository.getCartDetails(customerId);
    return this.formatCart(cartDetails, customerId);
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

  async addItemToCart(dto: AddToCartDto): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        cart = await this.cartRepository.createCart(dto.customerId, tx);
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // check if the product exists
      const menuItem = await this.getMenuItemDetails(dto.menuItemId, tx);
      if (!menuItem) {
        throw new NotFoundError("Product not found");
      }
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

      // check if the item already exists in the cart
      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (existingCartItem) {
        // If the item already exists, update the quantity
        await this.cartRepository.updateCartItemQuantity(
          cart.id,
          dto.menuItemId,
          existingCartItem.quantity + dto.quantity,
          tx,
        );
      } else {
        // If the item does not exist, add it to the cart
        await this.cartRepository.createCartItem(
          cart.id,
          dto.menuItemId,
          dto.quantity,
          menuItem.price,
          tx,
        );
      }

      // Return the updated cart with the new item added
      return await this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async updateQuantity(
    dto: UpdateCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // ensure that the item is exists in the cart
      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (!existingCartItem) {
        throw new NotFoundError("Cart item not found");
      }

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

      // Return the updated cart with the new item added
      return this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async increaseCartItemQuantity(
    dto: AdjustCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // ensure that the item is exists in the cart
      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (!existingCartItem) {
        throw new NotFoundError("Cart item not found");
      }
      // i used tne increaseCartItemQuantity instead of updateCartItemQuantity to practice more with prisma transactions and to make the code more readable, but we can use the updateCartItemQuantity as well by passing the existing quantity + 1
      await this.cartRepository.increaseCartItemQuantity(
        cart.id,
        dto.menuItemId,
        tx,
      );

      // Return the updated cart with the new item added
      return this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async decreaseCartItemQuantity(
    dto: AdjustCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // ensure that the item is exists in the cart
      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (!existingCartItem) {
        throw new NotFoundError("Cart item not found");
      }
      if (existingCartItem.quantity === 1) {
        await this.cartRepository.removeCartItem(cart.id, dto.menuItemId, tx);
      } else {
        await this.cartRepository.decreaseCartItemQuantity(
          cart.id,
          dto.menuItemId,
          tx,
        );
      }

      // Return the updated cart with the new item added
      return this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async removeItemFromCart(dto: RemoveCartItemDto) {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      // ensure that the item is exists in the cart
      const existingCartItem = await this.cartRepository.findCartItem(
        cart.id,
        dto.menuItemId,
        tx,
      );
      if (!existingCartItem) {
        throw new NotFoundError("Cart item not found");
      }

      await this.cartRepository.removeCartItem(cart.id, dto.menuItemId, tx);

      // Return the updated cart with the new item added
      return this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async clearCart(dto: ClearCartDto) {
    const cart = await prisma.$transaction(async (tx) => {
      // Check if the cart exists
      let cart = await this.cartRepository.findCartByCustomerId(
        dto.customerId,
        tx,
      );

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }
      // Ensure that the cart belongs to the customer making the request
      if (cart.customerId !== dto.customerId) {
        throw new ForbiddenError("Access denied to the specified cart");
      }

      await this.cartRepository.clearCart(cart.id, tx);

      // Return the updated cart with the new item added
      return this.syncCartSubTotal(dto.customerId, tx);
    });

    return this.formatCart(cart, dto.customerId);
  }

  async checkoutCart(cartId: number) {}
}
