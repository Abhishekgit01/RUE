import { Redis } from "@upstash/redis";
import { RUEResponse } from "../rlm/types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TTL = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Fetches a cached response from Redis.
 */
export async function getCachedResponse(cacheKey: string): Promise<RUEResponse | null> {
  try {
    const data = await redis.get<RUEResponse>(cacheKey);
    return data;
  } catch (error) {
    console.error("[RUE][CACHE ERROR] Failed to get response:", error);
    return null;
  }
}

/**
 * Stores a response in Redis with a 7-day TTL.
 */
export async function setCachedResponse(
  cacheKey: string,
  response: RUEResponse
): Promise<void> {
  try {
    await redis.set(cacheKey, response, { ex: TTL });
  } catch (error) {
    console.error("[RUE][CACHE ERROR] Failed to set response:", error);
  }
}

/**
 * Verifies the connection to Redis.
 */
export async function checkCacheHealth(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch (error) {
    console.error("[RUE][CACHE ERROR] Health check failed:", error);
    return false;
  }
}
