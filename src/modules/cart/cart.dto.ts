export interface AddToCartDto {
  menuItemId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityDto {
  menuItemId: number;
  quantity: number;
}

export interface AdjustCartItemQuantityDto {
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
  menuItemId: number;
}
