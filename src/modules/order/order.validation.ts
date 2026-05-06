import * as z from "zod";

export const placeOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    addressId: z.number().int().positive(),
    paymentMethod: z.enum(["STRIPE", "PAYPAL", "CASH_ON_DELIVERY"]),
  }),
});
