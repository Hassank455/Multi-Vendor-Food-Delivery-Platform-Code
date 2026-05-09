import * as z from "zod";
import { PaymentMethod } from "../../generated/prisma/enums";

export const placeOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    addressId: z.number().int().positive(),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});
