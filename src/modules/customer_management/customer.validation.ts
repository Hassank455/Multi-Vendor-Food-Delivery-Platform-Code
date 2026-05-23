import * as z from "zod";
import { PaymentMethod } from "../../generated/prisma/enums";

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

export const getProfileSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({}),
});

export const updateProfileSchema = z.object({
  params: z.object({}),
  query: z.object({}),
  body: z
    .object({
      name: requiredText(100).optional(),
      email: z.string().trim().email().max(255).optional(),
      phone: z.string().trim().min(7).max(20).optional(),
    })
    .refine(
      (body) =>
        [body.name, body.email, body.phone].some(
          (value) => value !== undefined,
        ),
      {
        message: "At least one field must be provided for update",
      },
    ),
});

export const createCustomerReviewSchema = z.object({
  params: z.object({}),
  query: z.object({}),
  body: z.object({
    orderId: z.coerce.number().int().positive(),
    rating: z.coerce.number().min(1).max(5),
    comment: optionalNullableText(500),
  }),
});

// export const getCustomerReviewsSchema = z.object({
//   body: z.object({}),
//   query: z.object({}),
//   params: z.object({}),
// });

// export const getPaymentPreferenceSchema = z.object({
//   body: z.object({}),
//   query: z.object({}),
//   params: z.object({}),
// });

// export const upsertPaymentPreferenceSchema = z.object({
//   params: z.object({}),
//   query: z.object({}),
//   body: z.object({
//     method: z.nativeEnum(PaymentMethod),
//   }),
// });

// export const deactivateMyAccountSchema = z.object({
//   body: z.object({}),
//   query: z.object({}),
//   params: z.object({}),
// });
