/**
 * Mirrors frontend computeDivergenceScore for session list enrichment (no shared package).
 */
type NodeShape = {
  nodeId: string;
  parentId: string | null;
  terms: string[];
};

function computeTrend(
  nodeId: string,
  map: Record<string, NodeShape>
): 'diverging' | 'converging' | 'stable' {
  const node = map[nodeId];
  if (!node?.parentId) return 'stable';
  const parent = map[node.parentId];
  if (!parent) return 'stable';
  const siblings = Object.values(map).filter(
    (n) => n.parentId === node.parentId && n.nodeId !== nodeId
  );

  const nodeTerms = new Set(node.terms.map((t) => t.toLowerCase()));
  const parentTerms = new Set(parent.terms.map((t) => t.toLowerCase()));
  const siblingTerms = new Set(
    siblings.flatMap((s) => s.terms.map((t) => t.toLowerCase()))
  );

  const parentOverlap = Array.from(nodeTerms).filter((t) => parentTerms.has(t)).length;
  const parentOverlapRatio = nodeTerms.size > 0 ? parentOverlap / nodeTerms.size : 0;

  const siblingOverlap = Array.from(nodeTerms).filter((t) => siblingTerms.has(t)).length;
  const siblingOverlapRatio =
    nodeTerms.size > 0 && siblingTerms.size > 0
      ? siblingOverlap / nodeTerms.size
      : 0;

  const convergenceSignal = parentOverlapRatio * 0.6 + siblingOverlapRatio * 0.4;
  const score = convergenceSignal * -2 + 1;
  const clamped = Math.max(-1, Math.min(1, score));

  if (clamped > 0.2) return 'diverging';
  if (clamped < -0.2) return 'converging';
  return 'stable';
}

export function countDivergenceForSessionNodes(
  nodes: NodeShape[]
): { diverging: number; converging: number } {
  const map: Record<string, NodeShape> = {};
  for (const n of nodes) {
    map[n.nodeId] = n;
  }
  let diverging = 0;
  let converging = 0;
  for (const n of nodes) {
    if (!n.parentId) continue;
    const t = computeTrend(n.nodeId, map);
    if (t === 'diverging') diverging++;
    if (t === 'converging') converging++;
  }
  return { diverging, converging };
}
