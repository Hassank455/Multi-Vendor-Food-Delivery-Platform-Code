import os from 'node:os'
import v8 from 'node:v8'

import type { FastifyCorsOptions } from '@fastify/cors'
import underPressure from '@fastify/under-pressure'
import fp from 'fastify-plugin'

import { AppError } from '@/lib/app-error'

export default fp<FastifyCorsOptions>(
  async (fastify) => {
    //? is it operational error
    class PressureError extends AppError {
      constructor() {
        super('Server is overloaded. Please try again later')
        Error.captureStackTrace(this, PressureError)
      }
    }

    fastify.register(underPressure, {
      // above 50-100ms users start noticing lag
      maxEventLoopDelay: 200,

      // reject work if it hits 90% of the memory Node is allowed to use
      maxHeapUsedBytes: v8.getHeapStatistics().heap_size_limit * 0.9,

      // prevent docker/OS "OOM Killer" from nuking the container
      maxRssBytes: os.totalmem() * 0.9,

      maxEventLoopUtilization: 0.95,

      retryAfter: 5, // for browser
      customError: PressureError,

      exposeStatusRoute: '/api/health',

      pressureHandler: (_request, reply, type, value) => {
        if (type === underPressure.TYPE_HEAP_USED_BYTES)
          fastify.log.warn(`too many heap bytes used: ${value}`)
        else if (type === underPressure.TYPE_RSS_BYTES)
          fastify.log.warn(`too many rss bytes used: ${value}`)

        // TODO: send email

        // optional: if you omit this line, the request will be handled normally
        reply.send('out of memory')
      },
    })
  },
  { name: 'back-pressure' },
)

// https://sachinkasana.medium.com/backpressure-in-node-js-the-concept-everyone-skips-0e6583e52b7f
