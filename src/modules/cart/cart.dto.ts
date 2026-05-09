export interface AddToCartDto {
  customerId: number;
  menuItemId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityDto {
  customerId: number;
  menuItemId: number;
  quantity: number;
}

export interface AdjustCartItemQuantityDto {
  customerId: number;
  menuItemId: number;
}

export interface CartItemResponseDto {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
}

export interface CartResponseDto {
  id?: number;
  customerId: number;
  restaurantId?: number | null;
  subTotal: number;
  items: CartItemResponseDto[];
}

export interface RemoveCartItemDto {
  customerId: number;
  menuItemId: number;
}

export interface ClearCartDto {
  customerId: number;
}
