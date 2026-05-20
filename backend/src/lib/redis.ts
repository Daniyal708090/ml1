import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

const fallbackCache = new Map<string, { value: unknown; expiresAt: number }>();

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn('Redis unavailable — caching disabled, falling back to memory');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000);
  },
});

let isRedisConnected = false;

redis.on('error', () => { /* Suppress noisy logs */ });
redis.on('connect', () => {
  isRedisConnected = true;
  logger.info('Redis connected');
});
redis.on('end', () => {
  isRedisConnected = false;
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (isRedisConnected) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  
  const cached = fallbackCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    fallbackCache.delete(key);
    return null;
  }
  return cached.value as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (isRedisConnected) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch {
      // Ignore
    }
  }
  
  fallbackCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
