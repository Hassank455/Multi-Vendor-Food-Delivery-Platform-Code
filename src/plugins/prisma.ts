import { PrismaPg } from '@prisma/adapter-pg'
import fp from 'fastify-plugin'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'
import { env } from '@/lib/env'

export default fp(
  async (fastify) => {
    const client = new PrismaClient({
      adapter: new PrismaPg(
        new Pool({
          connectionString: env.DATABASE_URL,

          // https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
          max: 20, // num_cpus::get_physical() * 2 + 1
          connectionTimeoutMillis: 10_000,
          idleTimeoutMillis: 30_000,

          // internal docker network
          // https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7#ssl-certificate-validation-changes
          ssl: false /* { rejectUnauthorized: false } */,
        }),
      ),
      log: env.LOG_PRISMA_QUERY ? ['info', 'query'] : undefined,
    })

    if (fastify.hasDecorator('rawDb'))
      throw new Error('The "rawDb" decorator has already been registered')

    await client.$connect()

    fastify.decorate('rawDb', client)

    fastify.addHook('onClose', async () => {
      await client.$disconnect()
    })
  },
  { name: 'prisma' },
)

declare module 'fastify' {
  interface FastifyInstance {
    rawDb: PrismaClient
  }
}
