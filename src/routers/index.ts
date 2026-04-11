import type { FastifyInstance } from 'fastify'

import { statusRoute } from './status'

export default async function restRoutes(fastify: FastifyInstance) {
  fastify.register(statusRoute, { prefix: '/status' })
}
