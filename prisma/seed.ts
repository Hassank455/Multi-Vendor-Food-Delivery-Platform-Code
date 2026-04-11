/* eslint-disable unicorn/no-process-exit, promise/prefer-await-to-callbacks, promise/always-return, no-console, n/no-process-env */

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from 'redis'

import { PrismaClient } from '@/generated/prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

const redisCache = createClient({ url: process.env.REDIS_CACHE_URL })

async function main() {}

main()
  .then(async () => {
    await Promise.all([db.$disconnect(), redisCache.close()])
  })
  .catch(async (error) => {
    console.error(error)
    await Promise.all([db.$disconnect(), redisCache.close()])
    process.exit(1)
  })
