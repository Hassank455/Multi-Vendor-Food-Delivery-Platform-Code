import * as z from "zod";
import { paginationQuerySchema } from "../../common/pagination";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const optionalNullableText = (max: number) =>
  z.preprocess((value) => {
    if (value == null) {
      return value;
    }

    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    return value;
  }, z.string().trim().max(max).nullable().optional());

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

// catalog schemas
export const getRestaurantsSchema = z.object({
  query: paginationQuerySchema.extend({
    q: z.string().trim().min(1).max(255).optional(),
  }),
});

export const getRestaurantByIdSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
});

export const getRestaurantMenuSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  query: paginationQuerySchema.extend({
    q: z.string().trim().min(1).max(255).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  }),
});

export const getRecommendedRestaurantsSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationQuerySchema,
});

export const getTopRatedRestaurantsSchema = z.object({
  query: paginationQuerySchema.extend({
    q: z.string().trim().min(1).max(255).optional(),
  }),
});

// owner schemas
export const createRestaurantSchema = z.object({
  body: z.object({
    name: requiredText(255),
    phone: optionalNullableText(50),
    address: optionalNullableText(255),
  }),
});

export const getMyRestaurantSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const updateRestaurantSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      name: requiredText(255).optional(),
      phone: optionalNullableText(50),
      address: optionalNullableText(255),
    })
    .refine(
      (body) =>
        [body.name, body.phone, body.address].some(
          (value) => value !== undefined,
        ),
      {
        message: "At least one field must be provided for update",
      },
    ),
});

export const updateRestaurantStatusSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    isEnabled: z.boolean(),
  }),
});

// menu item schemas
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

// menu category schemas
export const getOwnerCategoriesSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  query: paginationQuerySchema.extend({
    isActive: booleanFromString.optional(),
  }),
});

export const createMenuCategorySchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: requiredText(255),
  }),
});

export const updateMenuCategorySchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
    categoryId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: requiredText(255),
  }),
});

export const updateMenuCategoryStatusSchema = z.object({
  params: z.object({
    restaurantId: z.coerce.number().int().positive(),
    categoryId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});
