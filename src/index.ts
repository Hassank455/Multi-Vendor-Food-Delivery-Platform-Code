import '@/lib/error-management'

import closeWithGrace from 'close-with-grace'
import { fastify } from 'fastify'

import appService from '@/app'
import { env } from '@/lib/env'
import catchError from '@/utils/catch-error'

const app = fastify({
  trustProxy: env.PROD,
  disableRequestLogging: env.PROD,
  logger: {
    level: env.PROD ? 'warn' : 'info',
  },

  // Performance tuning
  connectionTimeout: 30_000,
  keepAliveTimeout: 30_000,
  bodyLimit: 1_048_576,
  // maxRequestsPerSocket: 1000,
  routerOptions: {
    caseSensitive: false,
    ignoreTrailingSlash: true,
  },
})

app.register(appService)

/**
 * delay is the number of milliseconds for the graceful close to finish
 * adds:
 * process.once('uncaughtException')
 * process.once('unhandledRejection')
 */
closeWithGrace(
  { delay: env.FASTIFY_CLOSE_GRACE_DELAY },
  async ({ signal, err, manual: _ }) => {
    if (err) app.log.error({ err }, 'server closing with error')
    else app.log.info(`${signal} received, server closing`)
    await app.close()
  },
)
;(async () => {
  const [error] = await catchError(
    app.listen({ port: env.API_PORT, host: '0.0.0.0' }),
  )
  if (!error) return

  app.log.error(error)
  process.exit(1) // eslint-disable-line unicorn/no-process-exit
})()
