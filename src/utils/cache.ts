import type { RedisClientType } from 'redis'

import { AppError } from '@/lib/app-error'
import { commonErrors } from '@/lib/error-management'

import catchError from './catch-error'

export const cacheTags = {
  session: (sessionId: string) => `session:${sessionId}`,
}

export async function getOrSetCache<T>({
  cacheClient,
  tag,
  expiresAt = 0,
  callback,
}: {
  cacheClient: RedisClientType
  tag: string
  expiresAt?: number
  callback: () => Promise<T>
}): Promise<T> {
  const [, cachedData] = await catchError(cacheClient.get(tag))
  if (cachedData != null) return JSON.parse(cachedData) as T

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  const [error, freshData] = await catchError(callback())
  if (error) throw new AppError(commonErrors.databaseError)

  await (expiresAt
    ? cacheClient.SETEX(tag, expiresAt, JSON.stringify(freshData))
    : cacheClient.SET(tag, JSON.stringify(freshData)))

  return freshData
}

export async function invalidateCache({
  cacheClient,
  tag,
}: {
  cacheClient: RedisClientType
  tag: string
}) {
  const [error] = await catchError(cacheClient.del(tag))
  if (error) throw new AppError(`Failed to invalidate cache for tag: ${tag}`)
}
