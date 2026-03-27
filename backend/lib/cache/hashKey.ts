import { createHash } from "crypto";
import { ContextChain } from "../rlm/types";

/**
 * Generates a deterministic cache key for a given context and term.
 */
export function generateCacheKey(context: ContextChain, term?: string): string {
  const raw = {
    root: context.rootQuestion.toLowerCase().trim(),
    path: context.explorationPath.map((p) => p.toLowerCase().trim()),
    term: term?.toLowerCase().trim() ?? "__root__",
  };

  const jsonString = JSON.stringify(raw);
  const hash = createHash("md5").update(jsonString).digest("hex");

  return `rue:${hash}`;
}

/**
 * Generates a simple warmup key for a query.
 */
export function generateWarmupKey(query: string): string {
  const raw = query.toLowerCase().trim();
  const hash = createHash("md5").update(raw).digest("hex");

  return `rue-warmup:${hash}`;
}
