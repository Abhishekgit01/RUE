import { NextResponse } from "next/server";
import { runExploration } from "@/backend/lib/rlm/recursion";
import { getCachedResponse, setCachedResponse } from "@/backend/lib/cache/kv";
import { generateExplanation } from "@/backend/lib/llm/client";
import { extractTermsFromExplanation } from "@/backend/lib/rlm/extractor";
import { validateExploreRequest } from "@/backend/lib/utils/validator";
import { logRequest, logCacheHit, logCacheMiss, logError, logLLMCall } from "@/backend/lib/utils/logger";
import { RUEResponse } from "@/backend/lib/rlm/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logRequest("/api/explore", body);

    // 1. Validate
    const validation = validateExploreRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: validation.error },
        { status: 400 }
      );
    }

    const { term, contextChain } = validation.data;

    // 2. Prepare Pipeline
    const { systemPrompt, extendedChain, cacheKey, shouldStop } = await runExploration(
      term,
      contextChain
    );

    // 3. Recursion Check
    if (shouldStop) {
      return NextResponse.json(
        { 
          error: "MAX_DEPTH_REACHED", 
          message: "Maximum exploration depth reached. You've gone 3 levels deep!" 
        },
        { status: 200 } // Return 200 so frontend can handle it gracefully
      );
    }

    // 4. Cache Check
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      logCacheHit(cacheKey);
      return NextResponse.json({ ...cached, cached: true });
    }

    logCacheMiss(cacheKey);
    logLLMCall("explore", extendedChain.currentDepth);

    // 5. LLM Call - Anchored Explanation
    const fullText = await generateExplanation(systemPrompt);

    // 6. LLM Call - Term Extraction for Sub-Concepts
    logLLMCall("extract", extendedChain.currentDepth);
    const terms = await extractTermsFromExplanation(fullText, extendedChain);

    // 7. Build & Cache Response
    const response: RUEResponse = {
      explanation: fullText,
      extractedTerms: terms,
      contextChain: extendedChain,
      cached: false,
      depth: extendedChain.currentDepth,
    };

    await setCachedResponse(cacheKey, response);

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    logError("/api/explore", error);
    
    // Check for specific error from recursion logic
    const errorCode = error.code === "INVALID_INPUT" ? "INVALID_INPUT" : "LLM_ERROR";
    const status = error.code === "INVALID_INPUT" ? 400 : 500;

    return NextResponse.json(
      { error: errorCode, message: error.message || "An unexpected error occurred." },
      { status }
    );
  }
}
