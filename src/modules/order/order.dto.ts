export interface PlaceOrderDto {
  customerId: number;
  addressId: number;
  paymentMethod: "STRIPE" | "PAYPAL" | "CASH_ON_DELIVERY";
}
