/* eslint-disable promise/prefer-await-to-callbacks */
import type { FastifyCorsOptions } from '@fastify/cors'
import { fastifyCors } from '@fastify/cors'
import fp from 'fastify-plugin'

import { AppError } from '@/lib/app-error'

export default fp<FastifyCorsOptions>(
  async (fastify) => {
    fastify.register(fastifyCors, {
      methods: ['GET', 'POST', 'PUT', 'BATCH', 'OPTIONS'],
      credentials: true,
      maxAge: 86_400,
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        cb(new AppError('Not allowed by CORS'), false)
      },
    })
  },
  { name: 'cors' },
)
