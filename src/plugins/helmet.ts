import type { FastifyHelmetOptions } from '@fastify/helmet'
import { fastifyHelmet } from '@fastify/helmet'
import fp from 'fastify-plugin'

export default fp<FastifyHelmetOptions>(
  async (fastify) => {
    fastify.register(fastifyHelmet, {
      hidePoweredBy: true,
    })
  },
  { name: 'helmet' },
)
