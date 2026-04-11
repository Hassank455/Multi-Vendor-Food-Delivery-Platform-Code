import rateLimitPlugin from '@fastify/rate-limit'
import type { FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import Redis from 'ioredis'

import { AppError } from '@/lib/app-error'
import { env } from '@/lib/env'

/* TODO: fix these security issues
- Distributed Brute Force
- Credential Stuffing/Spray
- OTP Cycling
*/

export default fp(
  async (fastify) => {
    // plugin required ioredis
    const rateLimitClient = new Redis(env.REDIS_CACHE_URL, {
      // pass through if redis is down or didn't respond fast
      connectTimeout: 500,
      maxRetriesPerRequest: 1,
    })

    await fastify.register(rateLimitPlugin, {
      global: false,
      redis: rateLimitClient,
      cache: 10_000,
      nameSpace: 'limiter-',
      skipOnError: true,
      addHeadersOnExceeding: {
        'x-ratelimit-limit': false,
        'x-ratelimit-remaining': false,
        'x-ratelimit-reset': false,
      },
      addHeaders: {
        'x-ratelimit-limit': false,
        'x-ratelimit-remaining': false,
        'x-ratelimit-reset': false,
        'retry-after': false,
      },
    })

    const keyGenerator = (groupId: string) => (req: FastifyRequest) => {
      // biome-ignore lint/suspicious/noExplicitAny: <>
      const body = req.body as any
      const email = body?.variables?.email ?? body?.variables?.data?.email
      return email ? `${groupId}-${email}` : req.ip
    }

    const PROFILES = {
      STRICT: { max: 3, timeWindow: 600_000 }, // 3 per 10 mins
      AUTH: { max: 5, timeWindow: 60_000 }, // 5 per 1 min
      SPAM: { max: 2, timeWindow: 3_600_000 }, // 2 per hour
      OTP: { max: 5, timeWindow: 300_000 }, // 5 per 5 mins
    }

    const limiters = {
      adminLogin: fastify.createRateLimit({
        ...PROFILES.STRICT,
        keyGenerator: keyGenerator('login'),
      }),

      login: fastify.createRateLimit({
        ...PROFILES.AUTH,
        keyGenerator: keyGenerator('login'),
      }),

      register: fastify.createRateLimit({ ...PROFILES.SPAM }),

      resendOtp: fastify.createRateLimit({
        max: 1,
        timeWindow: 60_000,
        keyGenerator: keyGenerator('otp'),
      }),

      verifyOtp: fastify.createRateLimit({
        ...PROFILES.OTP,
        keyGenerator: keyGenerator('otp'),
      }),

      requestResetToken: fastify.createRateLimit({
        ...PROFILES.SPAM,
        keyGenerator: keyGenerator('reset'),
      }),

      confirmResetToken: fastify.createRateLimit({
        ...PROFILES.STRICT,
        keyGenerator: keyGenerator('reset'),
      }),
    }

    const rateLimiter = async (
      request: FastifyRequest,
      type: keyof typeof limiters,
    ) => {
      if (env.APP_ENV !== 'production') return

      const limit = await limiters[type](request)

      if (!limit.isAllowed && limit.isExceeded)
        throw new AppError(
          `Too many requests. Please try again in ${limit.ttlInSeconds} seconds`,
        )
    }

    fastify.decorate('rateLimiter', rateLimiter)
  },

  { name: 'rate-limit', dependencies: ['redis'] },
)

type RateLimiterType =
  | 'adminLogin'
  | 'login'
  | 'register'
  | 'resendOtp'
  | 'verifyOtp'
  | 'requestResetToken'
  | 'confirmResetToken'

declare module 'fastify' {
  interface FastifyInstance {
    rateLimiter: (
      request: FastifyRequest,
      type: RateLimiterType,
    ) => Promise<void>
  }
}
