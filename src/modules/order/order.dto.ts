import { PaymentMethod, OrderStatus } from "../../generated/prisma/enums";
import {
  PaginationMetaDto,
  PaginationQueryDto,
} from "../../common/pagination";

export interface PlaceOrderDto {
  customerAddressId: number;
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

export interface CustomerOrderListItemDto {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  createdAt: Date;
  restaurant: {
    id: number;
    name: string;
  };
  items: PreparedOrderItem[];
}

export interface GetCustomerOrdersQueryDto extends PaginationQueryDto {
  status?: OrderStatus;
}

export interface PaginatedCustomerOrdersDto {
  data: CustomerOrderListItemDto[];
  pagination: PaginationMetaDto;
}

export interface CustomerOrderDetailsDto {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  createdAt: Date;
  restaurant: {
    id: number;
    name: string;
  };
  customerAddress: {
    id: number;
    street: string;
    city: string;
    buildingNo: string;
    postalCode: string;
    governorate: string;
  };
  items: PreparedOrderItem[];
  transactions: {
    id: number;
    amount: number;
    method: PaymentMethod;
    details: string | null;
    createdAt: Date;
  }[];
}

export interface RestaurantOrderListItemDto {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  createdAt: Date;
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  items: PreparedOrderItem[];
}

export interface RestaurantOrderDetailsDto {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  createdAt: Date;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
  customerAddress: {
    id: number;
    street: string;
    city: string;
    buildingNo: string;
    postalCode: string;
    governorate: string;
  };
  items: PreparedOrderItem[];
  transactions: {
    id: number;
    amount: number;
    method: PaymentMethod;
    details: string | null;
    createdAt: Date;
  }[];
}

export interface GetRestaurantOrdersQueryDto extends PaginationQueryDto {
  status?: OrderStatus;
}

export interface UpdateRestaurantOrderStatusDto {
  status: OrderStatus;
}

export interface PaginatedRestaurantOrdersDto {
  data: RestaurantOrderListItemDto[];
  pagination: PaginationMetaDto;
}

export interface CustomerOrderStatusDto {
  orderId: number;
  status: OrderStatus;
}