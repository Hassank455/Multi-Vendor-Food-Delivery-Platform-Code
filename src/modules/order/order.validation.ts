import * as z from "zod";
import { PaymentMethod } from "../../generated/prisma/enums";

export const placeOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    customerAddressId: z.number().int().positive(),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});
