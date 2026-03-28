import { ContextChain, APIExploreRequest, SaikiErrorCode } from "./types";
import {
  createInitialContextChain,
  extendContextChain,
  shouldStopRecursion,
  isTermAlreadyExplored,
} from "./anchor";
import {
  generateInitialAnswerPrompt,
  generateAnchoredExplanationPrompt,
} from "../llm/prompts";
import { generateCacheKey } from "../cache/hashKey";

/**
 * Orchestrates the initial root question pipeline.
 */
export async function runInitialQuery(question: string) {
  if (!question || question.trim().length === 0) {
    throw new Error("INVALID_INPUT");
  }

  const contextChain = createInitialContextChain(question);
  const systemPrompt = generateInitialAnswerPrompt(question);
  const cacheKey = generateCacheKey(contextChain);

  return {
    systemPrompt,
    contextChain,
    cacheKey,
  };
}

/**
 * Orchestrates the recursive exploration pipeline.
 */
export async function runExploration(
  term: string,
  contextChain: ContextChain
) {
  if (!term || term.trim().length === 0) {
    throw new Error("INVALID_INPUT");
  }

  // 1. Check max depth
  if (shouldStopRecursion(contextChain)) {
    return {
      shouldStop: true,
      systemPrompt: "",
      extendedChain: contextChain,
      cacheKey: "",
    };
  }

  // 2. Prevent infinite loops (though UI should prevent this)
  if (isTermAlreadyExplored(term, contextChain)) {
    const error: any = new Error("Term already explored in this path.");
    error.code = "INVALID_INPUT";
    throw error;
  }

  // 3. Extend context
  const extendedChain = extendContextChain(contextChain, term);

  // 4. Generate anchored prompt
  const systemPrompt = generateAnchoredExplanationPrompt(term, extendedChain);

  // 5. Generate cache key
  const cacheKey = generateCacheKey(extendedChain, term);

  return {
    systemPrompt,
    extendedChain,
    cacheKey,
    shouldStop: false,
  };
}
