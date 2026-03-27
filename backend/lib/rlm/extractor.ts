import { ContextChain, ExtractedTerm, MAX_TERMS } from "../rlm/types";
import { generateTermExtractionPrompt } from "../llm/prompts";
import { generateWithJSON } from "../llm/client";
import { parseTermExtractionResponse } from "../llm/schema";
import { isTermAlreadyExplored } from "./anchor";

/**
 * Orchestrates the extraction of key terms from an explanation.
 */
export async function extractTermsFromExplanation(
  explanation: string,
  context: ContextChain
): Promise<ExtractedTerm[]> {
  try {
    // 1. Generate prompt
    const prompt = generateTermExtractionPrompt(explanation, context);

    // 2. Call LLM for JSON extraction
    let rawJson = await generateWithJSON(prompt);
    console.log("[RUE][DEBUG] Raw Extraction JSON:", rawJson);
    
    // 3. Parse and validate
    let terms = parseTermExtractionResponse(rawJson);

    // 4. Retry once if decoding fails or result is empty
    if (!terms || terms.length === 0) {
      console.warn("[RUE][EXTRACTOR] First extraction attempt failed or empty. Retrying...");
      rawJson = await generateWithJSON(prompt);
      terms = parseTermExtractionResponse(rawJson);
    }

    if (!terms) return [];

    // 5. Filter out already explored terms
    const filteredTerms = terms.filter(
      (t) => !isTermAlreadyExplored(t.term, context)
    );

    // 6. Sort by difficulty score descending (most challenging concepts first)
    const sortedTerms = filteredTerms.sort(
      (a, b) => b.difficultyScore - a.difficultyScore
    );

    // 7. Return top MAX_TERMS (5)
    return sortedTerms.slice(0, MAX_TERMS);
  } catch (error) {
    console.error("[RUE][EXTRACTOR ERROR]:", error);
    return [];
  }
}
