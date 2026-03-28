import type { ChatNode } from '../../../types';

export interface DivergenceScore {
  score: number;
  label: string;
  description: string;
  trend: 'diverging' | 'converging' | 'stable';
}

export function computeDivergenceScore(nodeId: string, allNodes: Record<string, ChatNode>): DivergenceScore {
  const node = allNodes[nodeId];
  if (!node || !node.parentId) {
    return { score: 0, label: 'Origin', description: 'Starting point', trend: 'stable' };
  }

  const parent = allNodes[node.parentId];
  const siblings = Object.values(allNodes).filter(
    (n) => n.parentId === node.parentId && n.id !== nodeId
  );

  const nodeTerms = new Set(node.terms.map((t) => t.toLowerCase()));
  const parentTerms = new Set(parent.terms.map((t) => t.toLowerCase()));
  const siblingTerms = new Set(siblings.flatMap((s) => s.terms.map((t) => t.toLowerCase())));

  const parentOverlap = Array.from(nodeTerms).filter((t) => parentTerms.has(t)).length;
  const parentOverlapRatio = nodeTerms.size > 0 ? parentOverlap / nodeTerms.size : 0;

  const siblingOverlap = Array.from(nodeTerms).filter((t) => siblingTerms.has(t)).length;
  const siblingOverlapRatio =
    nodeTerms.size > 0 && siblingTerms.size > 0 ? siblingOverlap / nodeTerms.size : 0;

  const convergenceSignal = parentOverlapRatio * 0.6 + siblingOverlapRatio * 0.4;
  const score = convergenceSignal * -2 + 1;

  const clampedScore = Math.max(-1, Math.min(1, score));

  const label =
    clampedScore > 0.4 ? 'Diverging' : clampedScore < -0.4 ? 'Converging' : 'Stable';

  const description =
    clampedScore > 0.4
      ? 'Exploring new concepts — branching outward'
      : clampedScore < -0.4
        ? 'Revisiting familiar concepts — narrowing focus'
        : 'Balanced exploration';

  const trend =
    clampedScore > 0.2 ? 'diverging' : clampedScore < -0.2 ? 'converging' : 'stable';

  return { score: clampedScore, label, description, trend };
}

export function truncateToSixWords(text: string): string {
  return text.split(' ').slice(0, 6).join(' ') + (text.split(' ').length > 6 ? '…' : '');
}
