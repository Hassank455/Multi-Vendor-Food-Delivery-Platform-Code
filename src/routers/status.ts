import type { FastifyInstance } from 'fastify'

export async function statusRoute(fastify: FastifyInstance) {
  fastify.get('/', async (request) => {
    return request.server.memoryUsage()
  })
}
