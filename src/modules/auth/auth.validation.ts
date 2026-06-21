import * as z from "zod";

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().trim().min(1),
  })
  .strict();
export const customerSignupSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: z
    .object({
      name: requiredText(100),
      email: z.string().trim().email().max(255),
      password: z.string().min(8).max(128),
      phone: z.string().trim().min(7).max(20),
      gender: requiredText(20).optional(),
    })
    .strict(),
});

export const verifyEmailSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: z
    .object({
      email: z.string().trim().email().max(255),
      code: z.string().trim().length(6),
    })
    .strict(),
});

export const resendVerificationCodeSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: z
    .object({
      email: z.string().trim().email().max(255),
    })
    .strict(),
});

export const loginBodySchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: z
    .object({
      email: z.string().trim().email().max(255),
      password: z.string().min(8).max(128),
    })
    .strict(),
});

export const refreshCustomerTokenSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: refreshTokenBodySchema,
});

export const logoutCustomerSchema = z.object({
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: refreshTokenBodySchema,
});
