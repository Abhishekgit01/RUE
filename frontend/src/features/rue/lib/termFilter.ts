const BLOCKED_TERMS = new Set([
  'system',
  'process',
  'method',
  'approach',
  'technique',
  'concept',
  'way',
  'thing',
  'idea',
  'aspect',
  'factor',
  'element',
  'feature',
  'type',
  'kind',
  'form',
  'part',
  'role',
  'case',
  'level',
  'point',
  'result',
  'effect',
  'impact',
  'change',
  'use',
  'work',
  'model',
  'example',
  'data',
  'information',
  'knowledge',
  'understanding',
  'learning',
  'training',
  'testing',
  'analysis',
  'output',
  'input',
]);

const MIN_TERM_LENGTH = 4;
const MAX_TERM_LENGTH = 60;
const MAX_WORD_COUNT = 6;

export function filterTerms(rawTerms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of rawTerms) {
    const term = raw.trim();
    if (!term) continue;
    const lower = term.toLowerCase();
    const wordCount = lower.split(/\s+/).filter(Boolean).length;

    if (lower.length < MIN_TERM_LENGTH) continue;
    if (lower.length > MAX_TERM_LENGTH) continue;
    if (wordCount > MAX_WORD_COUNT) continue;
    if (BLOCKED_TERMS.has(lower)) continue;
    if (wordCount === 1 && /^(large|small|fast|slow|good|bad|high|low)$/.test(lower)) continue;
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(term);
  }

  return out;
}
