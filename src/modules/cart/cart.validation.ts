import * as z from "zod";

const addItemToCartSchema = z.object({
  menuItemId: z.number().positive(),
});

const updateCartItemQuantitySchema = z.object({
  customerId: z.number().positive(),
  productId: z.number().positive(),
  quantity: z.number().min(0),
});

export { addItemToCartSchema, updateCartItemQuantitySchema };
