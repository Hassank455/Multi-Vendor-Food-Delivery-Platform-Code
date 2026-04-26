import * as z from "zod";

const addItemToCartSchema = z.object({
  menuItemId: z.number().positive(),
});

export { addItemToCartSchema };
