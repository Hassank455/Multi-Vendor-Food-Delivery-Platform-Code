/* eslint-disable n/no-process-env, no-console */

import { z } from 'zod'

import { AppError } from './app-error'

const flagSchema = z
  .string()
  .transform((a) => a === '1')
  .default(false)

const schema = z.object({
  PROD: z.coerce
    .boolean()
    .transform(() => process.env.NODE_ENV === 'production'),
  APP_ENV: z.enum(['development', 'local', 'staging', 'production']),
  API_PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  FASTIFY_CLOSE_GRACE_DELAY: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(10_000),
  SERVER_URL: z.string().min(1),
  LOG_PRISMA_QUERY: flagSchema,

  // postgres
  DATABASE_URL: z.string().min(1),

  // redis
  REDIS_CACHE_URL: z.string().min(1),
})

const result = schema.safeParse(process.env)

if (!result.success) console.error(result.error)
if (!result.data) throw new AppError("env data doesn't exist", false)

export const env = result.data
