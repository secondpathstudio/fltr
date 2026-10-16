import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export interface RateLimiter {
  limit(key: string): Promise<{ success: boolean }>;
}

/**
 * Best-effort sliding-window limiter kept in process memory.
 *
 * TODO: this doesn't hold across serverless instances or cold starts. Set
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.
 */
export function createMemoryRateLimiter(
  max = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS,
  clock: () => number = Date.now,
): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(key) {
      const now = clock();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return { success: false };
      }
      recent.push(now);
      hits.set(key, recent);
      // Keep memory bounded on long-lived instances.
      if (hits.size > 10_000) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return { success: true };
    },
  };
}

let limiter: RateLimiter | undefined;

export function getRateLimiter(): RateLimiter {
  if (limiter) return limiter;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const upstash = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, "10 m"),
      prefix: "fltr:waitlist",
    });
    limiter = { limit: async (key) => ({ success: (await upstash.limit(key)).success }) };
  } else {
    limiter = createMemoryRateLimiter();
  }
  return limiter;
}
