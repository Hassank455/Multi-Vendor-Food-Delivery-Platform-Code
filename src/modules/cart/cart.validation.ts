import * as z from "zod";

const addItemToCartSchema = z.object({
  cartId: z.number().positive(),
  productId: z.number().positive(),
  quantity: z.number().positive(),
});

export { addItemToCartSchema };
