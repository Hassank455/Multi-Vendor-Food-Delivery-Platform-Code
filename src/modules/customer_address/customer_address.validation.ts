import * as z from "zod";

export const getCustomerAddressSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    customerId: z.number().int().positive(),
  }),
});
