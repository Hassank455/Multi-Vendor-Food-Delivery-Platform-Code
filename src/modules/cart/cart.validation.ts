import * as z from "zod";

const addItemToCartSchema = z.object({
  body: z.object({
    menuItemId: z.number().positive(),
  }),
  query: z.object({}),
  params: z.object({}),
});

const updateCartItemQuantitySchema = z.object({
  body: z.object({
    customerId: z.number().positive(),
    quantity: z.number().min(0),
  }),
  query: z.object({}),
  params: z.object({
    // coerce mean convert string to number
    menuItemId: z.coerce.number().positive(),
  }),
});

export { addItemToCartSchema, updateCartItemQuantitySchema };
