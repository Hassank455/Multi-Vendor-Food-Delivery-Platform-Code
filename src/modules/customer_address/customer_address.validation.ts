import * as z from "zod";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

// this will allow the field to be optional, and if it's provided, it can be a non-empty string or null
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

export const getCustomerAddressSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const getCustomerAddressesSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({}),
});

export const createCustomerAddressSchema = z.object({
  params: z.object({}),
  query: z.object({}),
  body: z.object({
    street: requiredText(255),
    city: requiredText(255),
    buildingNo: optionalNullableText(50),
    postalCode: optionalNullableText(20),
    governorate: requiredText(255),
  }),
});

export const updateCustomerAddressSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: z
    .object({
      street: requiredText(255).optional(),
      city: requiredText(255).optional(),
      buildingNo: optionalNullableText(50),
      postalCode: optionalNullableText(20),
      governorate: requiredText(255).optional(),
    })
    .refine(
      (body) =>
        [
          body.street,
          body.city,
          body.buildingNo,
          body.postalCode,
          body.governorate,
        ].some((value) => value !== undefined),
      {
        message: "At least one field must be provided for update",
      },
    ),
});

export const deleteCustomerAddressSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
