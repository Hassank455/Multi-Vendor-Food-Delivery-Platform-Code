import * as z from "zod";
import { paginationQuerySchema } from "../../../common/pagination";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const createMenuItemSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: requiredText(255),
    description: requiredText(1000),
    categoryId: z.number().int().positive(),
    price: z.number().positive(),
  }),
});

export const getOwnerMenuItemsSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  query: paginationQuerySchema.extend({
    categoryId: z.coerce.number().int().positive().optional(),
    isAvailable: booleanFromString.optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
    menuItemId: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      name: requiredText(255).optional(),
      description: requiredText(1000).optional(),
      categoryId: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
    })
    .refine(
      (body) =>
        [body.name, body.description, body.categoryId, body.price].some(
          (value) => value !== undefined,
        ),
      {
        message: "At least one field must be provided for update",
      },
    ),
});

export const updateMenuItemStatusSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
    menuItemId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export const deleteMenuItemSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
    menuItemId: z.coerce.number().int().positive(),
  }),
});

export const getOwnerCategoriesSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  query: paginationQuerySchema.extend({
    isActive: booleanFromString.optional(),
  }),
});
export const menuCategorySchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: requiredText(255),
  }),
});
