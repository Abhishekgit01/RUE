import { z } from "zod";
import { ExtractedTerm } from "../rlm/types";

export const ExtractedTermSchema = z.object({
  term: z.string().min(1).max(100),
  reason: z.string().min(10).max(300),
  difficultyScore: z.number().int().min(1).max(5),
});

export const TermExtractionResponseSchema = z.object({
  terms: z.array(ExtractedTermSchema).min(1).max(5),
});

/**
 * Strips markdown backticks and parses the JSON response from the LLM.
 */
export function parseTermExtractionResponse(rawJson: string): ExtractedTerm[] | null {
  try {
    // 1. Find the first '{' and the last '}'
    const startIndex = rawJson.indexOf("{");
    const endIndex = rawJson.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error("[Saiki][SCHEMA ERROR] No valid JSON object found in response.");
      return null;
    }

    const cleanJson = rawJson.substring(startIndex, endIndex + 1).trim();

    // 2. Parse JSON
    const parsed = JSON.parse(cleanJson);

    // 3. Validate with Zod
    const result = TermExtractionResponseSchema.safeParse(parsed);

    if (!result.success) {
      console.error("[Saiki][SCHEMA ERROR] Zod validation failed:", result.error.format());
      return null;
    }

    return result.data.terms;
  } catch (error) {
    console.error("[Saiki][SCHEMA ERROR] JSON parsing failed:", error);
    return null;
  }
}
