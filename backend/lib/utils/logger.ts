/**
 * Simple structured logger for RUE backend.
 */

function getTimestamp() {
  return new Date().toISOString();
}

export function logRequest(route: string, data: object): void {
  console.log(`[RUE][${getTimestamp()}][REQUEST][${route}]`, JSON.stringify(data));
}

export function logCacheHit(cacheKey: string): void {
  console.log(`[RUE][${getTimestamp()}][CACHE HIT] key: ${cacheKey}`);
}

export function logCacheMiss(cacheKey: string): void {
  console.log(`[RUE][${getTimestamp()}][CACHE MISS] key: ${cacheKey}`);
}

export function logError(route: string, error: any): void {
  console.error(`[RUE][${getTimestamp()}][ERROR][${route}]`, error?.message || error);
}

export function logLLMCall(type: "ask" | "explore" | "extract", depth: number): void {
  console.log(`[RUE][${getTimestamp()}][LLM CALL] type: ${type} depth: ${depth}`);
}
