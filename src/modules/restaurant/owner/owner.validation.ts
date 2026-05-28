import * as z from "zod";

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

export const createRestaurantSchema = z.object({
  body: z.object({
    name: requiredText(255),
    phone: optionalNullableText(50),
    address: optionalNullableText(255),
  }),
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
      (body) => [body.name, body.phone, body.address].some((value) => value !== undefined),
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
