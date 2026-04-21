import type { CartEvent } from "../domain/cart.events";
import { ConcurrencyError } from "../domain/cart.errors";

export interface CartEventStoreRepository {
  append(events: CartEvent[], expectedVersion: number): Promise<void>;
  getEventsByCartId(cartId: string): Promise<CartEvent[]>;
  getAllEvents(): Promise<CartEvent[]>;
}

export { ConcurrencyError };
