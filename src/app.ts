import formBodyPlugin from '@fastify/formbody'
import type { FastifyInstance } from 'fastify'

import backPressurePlugin from '@/plugins/back-pressure'
import corsPlugin from '@/plugins/cors'
import helmetPlugin from '@/plugins/helmet'
import prismaPlugin from '@/plugins/prisma'
import rateLimitPlugin from '@/plugins/rate-limit'
import redisPlugin from '@/plugins/redis'
import restRoutes from '@/routers'

export default async function app(fastify: FastifyInstance): Promise<void> {
  await Promise.all([
    fastify.register(formBodyPlugin),
    fastify.register(corsPlugin),
    fastify.register(helmetPlugin),
    fastify.register(prismaPlugin),
    fastify.register(redisPlugin),
    fastify.register(backPressurePlugin),
  ])

  await fastify.register(rateLimitPlugin)
  await fastify.register(restRoutes, { prefix: '/api' })
}
