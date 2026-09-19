import * as z from "zod";

// Requests like GET /cart and DELETE /cart/clear usually do not send a body.
const emptyShape = z.object({}).optional().default({});

const getMyCartSchema = z.object({
  body: emptyShape,
  query: emptyShape,
  params: emptyShape,
});

const addItemToCartSchema = z.object({
  body: z.object({
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  }),
  query: z.object({}),
  params: z.object({}),
});

const updateCartItemQuantitySchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0),
  }),
  query: z.object({}),
  params: z.object({
    // coerce converts the route param from string to number before validation
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const adjustCartItemQuantitySchema = z.object({
  // customer identity comes from isAuth, so this body stays empty on purpose
  body: emptyShape,
  query: emptyShape,
  params: z.object({
    // coerce converts the route param from string to number before validation
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const removeCartItemSchema = z.object({
  // customer identity comes from isAuth, so this body stays empty on purpose
  body: emptyShape,
  query: emptyShape,
  params: z.object({
    // coerce converts the route param from string to number before validation
    menuItemId: z.coerce.number().int().positive(),
  }),
});

const clearCartSchema = z.object({
  body: emptyShape,
  query: emptyShape,
  params: emptyShape,
});

export {
  getMyCartSchema,
  addItemToCartSchema,
  updateCartItemQuantitySchema,
  adjustCartItemQuantitySchema,
  removeCartItemSchema,
  clearCartSchema,
};
