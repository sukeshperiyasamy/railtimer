import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

function createClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/** Default TTL for cached live-data lookups (PNR / running status / availability). */
export const CACHE_TTL_SECONDS = 180;

/**
 * Cache-first read-through helper. Falls back to calling `fetcher` directly
 * (no caching) when Redis isn't configured, so local dev works without
 * Upstash credentials.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  const hit = await redis.get<T>(key);
  if (hit !== null && hit !== undefined) {
    return hit;
  }

  const value = await fetcher();
  await redis.set(key, value, { ex: ttlSeconds });
  return value;
}
