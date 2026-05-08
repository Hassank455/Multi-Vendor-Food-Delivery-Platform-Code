import { PaymentMethod } from "../../generated/prisma/enums";

export interface PlaceOrderDto {
  customerId: number;
  addressId: number;
  //   paymentMethod: "STRIPE" | "PAYPAL" | "CASH_ON_DELIVERY";
  paymentMethod: PaymentMethod;
}

export interface CartItemForCheckout {
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
    isAvailable: boolean;
    restaurantId: number;
  };
}

export interface CartForCheckout {
  id: number;
  customerId: number;
  restaurantId: number | null;
  subTotal: number;
  items: CartItemForCheckout[];
}

export interface PreparedOrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderItemInput {
  menuItemId: number;
  quantity: number;
  price: number;
}
