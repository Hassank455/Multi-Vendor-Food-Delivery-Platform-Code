import * as z from "zod";
import { PaymentMethod, OrderStatus } from "../../generated/prisma/enums";

export const placeOrderSchema = z.object({
  body: z.object({
    customerAddressId: z.number().int().positive(),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

export const getCustomerOrderByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const getRestaurantOrderDetailsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const updateRestaurantOrderStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});

export const getRestaurantOrdersSchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});
