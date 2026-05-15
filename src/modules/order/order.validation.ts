import * as z from "zod";
import { PaymentMethod } from "../../generated/prisma/enums";

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
