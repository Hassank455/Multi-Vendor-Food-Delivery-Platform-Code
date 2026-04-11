/* eslint-disable unicorn/no-process-exit, promise/prefer-await-to-callbacks, promise/always-return, no-console, n/no-process-env */

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  console.log('seeding...')

  console.log('seeded')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
