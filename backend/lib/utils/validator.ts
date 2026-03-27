import { APIAskRequest, APIExploreRequest } from "../rlm/types";
import { validateContextChain } from "../rlm/anchor";

/**
 * Validates the /api/ask request body.
 */
export function validateAskRequest(body: any):
  | { valid: true; data: APIAskRequest }
  | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body." };
  }

  const { question } = body;

  if (typeof question !== "string" || question.trim().length === 0) {
    return { valid: false, error: "Question must be a non-empty string." };
  }

  if (question.length > 500) {
    return { valid: false, error: "Question is too long (max 500 characters)." };
  }

  return {
    valid: true,
    data: { question: question.trim() },
  };
}

/**
 * Validates the /api/explore request body.
 */
export function validateExploreRequest(body: any):
  | { valid: true; data: APIExploreRequest }
  | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body." };
  }

  const { term, contextChain } = body;

  if (typeof term !== "string" || term.trim().length === 0) {
    return { valid: false, error: "Term must be a non-empty string." };
  }

  if (term.length > 100) {
    return { valid: false, error: "Term is too long (max 100 characters)." };
  }

  if (!validateContextChain(contextChain)) {
    return { valid: false, error: "Invalid context chain provided." };
  }

  return {
    valid: true,
    data: {
      term: term.trim(),
      contextChain,
    },
  };
}
