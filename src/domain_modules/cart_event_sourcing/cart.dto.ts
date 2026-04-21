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
