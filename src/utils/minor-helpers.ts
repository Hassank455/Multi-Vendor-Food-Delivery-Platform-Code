/* eslint-disable no-console */

import { inspect } from 'node:util'

import { env } from '@/lib/env'

export function consoleLog(obj: unknown) {
  if (env.PROD) return
  console.log(inspect(obj, false, null, true))
}
