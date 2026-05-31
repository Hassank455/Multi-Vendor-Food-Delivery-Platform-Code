import * as z from "zod";
import { paginationQuerySchema } from "../../../common/pagination";

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

export const searchRestaurantMenuItemsSchema = getRestaurantMenuSchema;

export const getRecommendedRestaurantsSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: paginationQuerySchema,
});