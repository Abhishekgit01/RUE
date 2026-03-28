import { NextResponse } from "next/server";
import { runInitialQuery } from "@/backend/lib/rlm/recursion";
import { getCachedResponse, setCachedResponse } from "@/backend/lib/cache/kv";
import { generateExplanation } from "@/backend/lib/llm/client";
import { extractTermsFromExplanation } from "@/backend/lib/rlm/extractor";
import { validateAskRequest } from "@/backend/lib/utils/validator";
import { logRequest, logCacheHit, logCacheMiss, logError, logLLMCall } from "@/backend/lib/utils/logger";
import { SaikiResponse } from "@/backend/lib/rlm/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logRequest("/api/ask", body);

    // 1. Validate
    const validation = validateAskRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: validation.error },
        { status: 400 }
      );
    }

    const { question } = validation.data;

    // 2. Prepare Pipeline
    const { systemPrompt, contextChain, cacheKey } = await runInitialQuery(question);

    // 3. Cache Check
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      logCacheHit(cacheKey);
      return NextResponse.json({ ...cached, cached: true });
    }

    logCacheMiss(cacheKey);
    logLLMCall("ask", 0);

    // 4. LLM Call - Initial Answer
    const fullText = await generateExplanation(systemPrompt);

    // 5. LLM Call - Term Extraction
    logLLMCall("extract", 0);
    const terms = await extractTermsFromExplanation(fullText, contextChain);

    // 6. Build & Cache Response
    const response: SaikiResponse = {
      explanation: fullText,
      extractedTerms: terms,
      contextChain: contextChain,
      cached: false,
      depth: 0,
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
    logError("/api/ask", error);
    return NextResponse.json(
      { error: "LLM_ERROR", message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
