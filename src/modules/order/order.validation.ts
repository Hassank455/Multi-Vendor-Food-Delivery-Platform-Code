import * as z from "zod";
import { PaymentMethod, OrderStatus } from "../../generated/prisma/enums";
import { paginationQuerySchema } from "../../common/pagination";

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
  query: paginationQuerySchema.extend({
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export const getCustomerOrdersSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationQuerySchema.extend({
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export const getCustomerOrderStatusSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});