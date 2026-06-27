import * as z from "zod";

const createManagedUserBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  })
  .strict();

export const createAdminSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: createManagedUserBodySchema,
});

export const createRestaurantOwnerSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: createManagedUserBodySchema,
});
