# 📜 RUE Backend API Contract

This document defines the interface for the frontend to communicate with the RUE backend.

## 🔗 Shared Types
Frontend should import types directly from the backend to ensure synchronization:
```typescript
import type { 
  RUEResponse, 
  ContextChain, 
  ExtractedTerm,
  RUEError 
} from '@/backend/lib/rlm/types';
```

---

## 🚀 Endpoints

### 1. Initial Question
`POST /api/ask`
Starts a new understanding thread.

**Request:**
```typescript
{
  question: string; // e.g. "What is LIME in AI?"
}
```

**Response:** `RUEResponse`
```typescript
{
  explanation: string;
  extractedTerms: ExtractedTerm[];
  contextChain: ContextChain;
  cached: boolean;
  depth: 0;
}
```

---

### 2. Term Exploration (Recursion)
`POST /api/explore`
Drills down into a specific term.

**Request:**
```typescript
{
  term: string;               // Term to explore
  contextChain: ContextChain; // Send back the chain received from previous response
}
```

**Response:** `RUEResponse`
```typescript
{
  explanation: string;
  extractedTerms: ExtractedTerm[];
  contextChain: ContextChain; // Updated chain (depth++)
  cached: boolean;
  depth: number;
}
```

---

## ⚠️ Error Handling

Errors are returned with status 400 or 500 and the following shape:
```typescript
{
  error: string;   // Code
  message: string; // Human readable description
}
```

| Error Code | Meaning | Recommended UI Action |
|---|---|---|
| `MAX_DEPTH_REACHED` | Attempted to go beyond 3 levels. | Disable term clicking, show "Deepest Level" badge. |
| `INVALID_INPUT` | Empty question/term or malformed chain. | Show validation toast. |
| `LLM_ERROR` | LLM or API failed. | Show "Try again later" state. |
| `EXTRACTION_FAILED` | Couldn't extract sub-terms. | Show explanation only, hide drill-down chips. |

---

## 🛠️ Integration Rules

1. **ContextChain is Immutable:** The frontend must NEVER mutate the `ContextChain` object. Always store the one returned from the last API call and send it back as-is in the next `/api/explore` call.
2. **Back Navigation:** To go "back" a level, Abhishek should maintain a local stack of `ContextChain` objects in the Zustand store.
3. **Streaming UX:** While the API returns full JSON for consistency, the `explanation` text should be rendered with a "typing" effect or collected via a stream hook if Abhishek prefers.
4. **Cache Indicator:** If `cached: true`, consider showing a small "⚡ Instant" badge to show off the system's performance.

---

## 🧪 Joint Handoff Test (Verification Checklist)

Once the `useRUE.ts` hook is wired, Abhishek and backend should run this together:

1. **Initial Flow:** Type "What is LIME in AI?". Verify explanation arrives and 3-5 chips appear.
2. **Context Extension:** Click a term (e.g., "model-agnostic"). Verify `contextChain.explorationPath` has 1 item and `currentDepth` = 1.
3. **Anchoring Check:** Ensure the sub-explanation explicitly mentions the root question or LIME.
4. **Depth Boundary:** Try to go 4 levels deep. Verify buttons disable or API returns `MAX_DEPTH_REACHED`.
5. **Back Navigation:** Click 'Back' and ensure the `ContextChain` from the previous state is restored and sent to the API.

---

## 🏆 Final Demo Readiness Checklist
- [x] **Latency:** Fresh response < 4s (Meta-Llama-3.3-70B).
- [x] **CORS:** Explicitly enabled for cross-origin frontend.
- [x] **Cleaning:** `<think>` blocks are stripped from R1/Llama output.
- [x] **Cache:** Upstash Redis provides <1s return for repeated paths.
