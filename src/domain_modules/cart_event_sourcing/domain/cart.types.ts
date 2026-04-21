export type CartStatus = "EMPTY" | "ACTIVE" | "CHECKED_OUT";

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  id: string;
  userId: string | null;
  currency: string | null;
  status: CartStatus;
  items: Record<string, CartItem>;
  version: number;
  created: boolean;
}
