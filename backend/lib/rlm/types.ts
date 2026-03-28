export interface RootQuestion {
  id: string;           // UUID v4
  text: string;         // raw question from user
  timestamp: number;    // Date.now()
}

export interface ContextChain {
  rootQuestion: string;           // NEVER changes after creation
  explorationPath: string[];      // grows with each drill-down
  currentDepth: number;           // 0 = root answer, max = 3
}

export interface ExtractedTerm {
  term: string;                   // exact phrase from explanation text
  reason: string;                 // one sentence why this matters
  difficultyScore: number;        // 1-5, higher = more worth exploring
}

export interface SaikiResponse {
  explanation: string;            // LLM explanation text
  extractedTerms: ExtractedTerm[]; // 3-5 terms max
  contextChain: ContextChain;     // updated chain to send back
  cached: boolean;                // true if served from Redis
  depth: number;                  // current depth level
}

export interface APIAskRequest {
  question: string;               // initial question from user
}

export interface APIExploreRequest {
  term: string;                   // the term user clicked
  contextChain: ContextChain;     // full chain from frontend state
}

export type SaikiErrorCode =
  | "MAX_DEPTH_REACHED"
  | "EXTRACTION_FAILED"
  | "INVALID_INPUT"
  | "CACHE_ERROR"
  | "LLM_ERROR";

export interface SaikiError {
  error: SaikiErrorCode;
  message: string;
}

export const MAX_DEPTH = 3;
export const MAX_TERMS = 5;
