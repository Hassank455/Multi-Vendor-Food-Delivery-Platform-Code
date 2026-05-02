import * as z from "zod";

const addItemToCartSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  }),
});

const updateCartItemQuantitySchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    quantity: z.number().int().min(0),
  }),
  query: z.object({}),
  params: z.object({
    // coerce mean convert string to number
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const adjustCartItemQuantitySchema = z.object({
  // we will delete the body when we implement the isAuth middleware, because we will get the customerId from the token
  body: z.object({
    customerId: z.number().int().positive(),
  }),
  params: z.object({
    // coerce mean convert string to number
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const removeCartItemSchema = z.object({
  // we will delete the body when we implement the isAuth middleware, because we will get the customerId from the token
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
  removeCartItemSchema,
};
