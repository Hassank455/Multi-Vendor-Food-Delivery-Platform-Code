import fp from 'fastify-plugin'
import type { RedisClientType } from 'redis'
import { createClient } from 'redis'

import { AppError } from '@/lib/app-error'
import { env } from '@/lib/env'

export default fp(
  async (fastify) => {
    fastify.log.warn(env.REDIS_CACHE_URL)

    const client = createClient({
      url: env.REDIS_CACHE_URL,
      socket: {
        keepAlive: true,
        keepAliveInitialDelay: 5000,
        connectTimeout: 5000, // init

        reconnectStrategy: (retries) => {
          if (retries > 15) return new AppError('Redis Max Retries')
          return Math.min(retries * 100, 3000)
        },
      },
    })

    client.on('error', (err) => fastify.log.error(err, 'Redis Client Error'))

    await client.connect()

    fastify.decorate('cache', client as RedisClientType)

    fastify.addHook('onClose', async () => {
      await client.quit()
    })
  },

  { name: 'redis' },
)

declare module 'fastify' {
  interface FastifyInstance {
    cache: RedisClientType
  }
}
