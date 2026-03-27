import { ContextChain, MAX_DEPTH } from "./types";

/**
 * Creates the starting context chain for a new root question.
 */
export function createInitialContextChain(question: string): ContextChain {
  return {
    rootQuestion: question.trim(),
    explorationPath: [],
    currentDepth: 0,
  };
}

/**
 * Extends the context chain with a new term.
 */
export function extendContextChain(
  current: ContextChain,
  newTerm: string
): ContextChain {
  return {
    rootQuestion: current.rootQuestion, // NEVER changes
    explorationPath: [...current.explorationPath, newTerm.trim()],
    currentDepth: current.currentDepth + 1,
  };
}

/**
 * Collapses the context chain (goes back one level).
 */
export function collapseContextChain(current: ContextChain): ContextChain {
  if (current.currentDepth === 0) return current;

  return {
    rootQuestion: current.rootQuestion,
    explorationPath: current.explorationPath.slice(0, -1),
    currentDepth: current.currentDepth - 1,
  };
}

/**
 * Checks if max recursion depth has been reached.
 */
export function shouldStopRecursion(context: ContextChain): boolean {
  return context.currentDepth >= MAX_DEPTH;
}

/**
 * Checks if a term has already been explored in this path.
 */
export function isTermAlreadyExplored(
  term: string,
  context: ContextChain
): boolean {
  const normalized = term.toLowerCase().trim();
  return context.explorationPath.some(
    (p) => p.toLowerCase().trim() === normalized
  );
}

/**
 * Type guard for ContextChain.
 */
export function validateContextChain(context: any): context is ContextChain {
  return (
    context &&
    typeof context.rootQuestion === "string" &&
    context.rootQuestion.length > 0 &&
    Array.isArray(context.explorationPath) &&
    typeof context.currentDepth === "number" &&
    context.currentDepth >= 0 &&
    context.currentDepth <= MAX_DEPTH
  );
}
