import type { FastifyInstance } from 'fastify'

export async function cartRoute(fastify: FastifyInstance) {
  fastify.get('/', async (_request, _reply) => {
    return { cart: [] }
  })
}
