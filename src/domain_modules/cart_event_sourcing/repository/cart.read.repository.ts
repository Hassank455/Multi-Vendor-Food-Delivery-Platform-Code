import type { CartStatus } from "../domain/cart.types";

export interface CartReadModelRecord {
  cartId: string;
  userId: string;
  currency: string;
  status: CartStatus;
  items: Array<{
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  totalQuantity: number;
  totalPrice: number;
  version: number;
}

export interface CartReadRepository {
  save(cart: CartReadModelRecord): Promise<void>;
  findById(cartId: string): Promise<CartReadModelRecord | null>;
}
