import { PaymentMethod, OrderStatus } from "../../generated/prisma/enums";
import type { Prisma } from "../../generated/prisma/client";
import { PaginationMetaDto, PaginationQueryDto } from "../../common/pagination";

export interface PlaceOrderDto {
  customerAddressId: number;
  paymentMethod: PaymentMethod;
}

export interface CartItemForCheckout {
  menuItemId: number;
  quantity: number;
  price: Prisma.Decimal;
  menuItem: {
    id: number;
    name: string;
    price: Prisma.Decimal;
    isAvailable: boolean;
    restaurantId: number;
  };
}

export interface CartForCheckout {
  id: number;
  customerId: number;
  restaurantId: number | null;
  subTotal: Prisma.Decimal;
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
  price: Prisma.Decimal;
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

export interface OrderSummaryDto {
  restaurant: {
    id: number;
    name: string;
  };
  customerAddress: {
    id: number;
    street: string;
    city: string;
    buildingNo: string | null;
    postalCode: string | null;
    governorate: string;
  };
  paymentMethod: PaymentMethod;
  items: {
    menuItemId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isAvailable: boolean;
  }[];
  pricing: {
    subTotal: number;
    discountAmount: number;
    deliveryFee: number;
    taxAmount: number;
    total: number;
  };
}
export interface GetOrderSummaryDto {
  customerAddressId: number;
  paymentMethod: PaymentMethod;
}
