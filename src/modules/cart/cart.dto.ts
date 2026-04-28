export interface UpdateCartItemQuantityDto {
  customerId: number;
  menuItemId: number;
  quantity: number;
}

export interface AdjustCartItemQuantityDto {
  customerId: number;
  menuItemId: number;
}
