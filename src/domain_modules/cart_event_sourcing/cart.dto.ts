import type { CartStatus } from "./domain/cart.types";
import type { CartEvent } from "./domain/cart.events";

export interface CreateCartDto {
  cartId: string;
  userId: string;
  currency: string;
}

export interface AddItemDto {
  cartId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}
export interface CartItemResponseDto {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartResponseDto {
  cartId: string;
  userId: string;
  currency: string;
  status: CartStatus;
  items: CartItemResponseDto[];
  totalQuantity: number;
  totalPrice: number;
  version: number;
}

export type CartEventResponseDto = CartEvent;

export interface ChangeQuantityDto {
  cartId: string;
  productId: string;
  amount: number;
}

export interface RemoveItemDto {
  cartId: string;
  productId: string;
}

export interface ResetCartDto {
  cartId: string;
}

export interface CheckoutCartDto {
  cartId: string;
}
