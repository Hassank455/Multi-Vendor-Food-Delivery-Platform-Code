import * as z from "zod";

const addItemToCartSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    menuItemId: z.number().int().positive(),
    quantity: z.number().min(0),
  }),
});

const updateCartItemQuantitySchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    quantity: z.number().min(0),
  }),
  query: z.object({}),
  params: z.object({
    // coerce mean convert string to number
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const adjustCartItemQuantitySchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
  }),
  params: z.object({
    // coerce mean convert string to number
    menuItemId: z.coerce.number().int().positive(),
  }),
});

export {
  addItemToCartSchema,
  updateCartItemQuantitySchema,
  adjustCartItemQuantitySchema,
};
