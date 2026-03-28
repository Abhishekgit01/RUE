import { NextResponse } from "next/server";
import { checkCacheHealth } from "@/backend/lib/cache/kv";
import { GOLDEN_PATHS } from "@/backend/tests/golden-paths";
import { logRequest, logError } from "@/backend/lib/utils/logger";

const WARMUP_SECRET = process.env.WARMUP_SECRET || "rue-demo-2025";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logRequest("/api/warmup", body);

    // 1. Authorization
    if (body.secret !== WARMUP_SECRET) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2. Health & Connection Check
    const healthy = await checkCacheHealth();
    if (!healthy) {
      return NextResponse.json({ error: "REDIS_CONNECTION_FAILED" }, { status: 500 });
    }

    // 3. Process Golden Paths
    const results = {
      success: 0,
      failed: 0,
      details: [] as string[],
    };

    // Use internal function calls or absolute URLs for internal fetch
    for (const question of GOLDEN_PATHS) {
      try {
        console.log(`[Saiki][WARMUP] Processing: "${question}"`);
        
        const response = await fetch(`${BASE_URL}/api/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (response.ok) {
          results.success++;
          results.details.push(`Warmed: ${question}`);
        } else {
          results.failed++;
          results.details.push(`Failed: ${question} (Status: ${response.status})`);
        }

        // Rate limiting for the demo runner
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (err: any) {
        results.failed++;
        results.details.push(`Error: ${question} - ${err.message}`);
      }
    }

    return NextResponse.json({
      message: "Warmup complete.",
      ...results,
    });
  } catch (error: any) {
    logError("/api/warmup", error);
    return NextResponse.json({ error: "WARMUP_FAILED", message: error.message }, { status: 500 });
  }
}
