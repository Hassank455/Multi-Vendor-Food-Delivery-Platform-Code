import { cartRoute } from '@module/cart'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { statusRoute } from './status'

export default async function restRoutes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.register(statusRoute, { prefix: '/status' })
  app.register(cartRoute, { prefix: '/cart' })
}
