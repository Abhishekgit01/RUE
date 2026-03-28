import type { ExtractedTerm } from '../types';

interface HighlightedTextProps {
  text: string;
  terms: ExtractedTerm[];
  depth: number;
  depthLimit: number;
  onTermClick: (term: string, pos?: { x: number; y: number }) => void;
  exploredTerms: Set<string>;
}

export default function HighlightedText({
  text,
  terms,
  depth,
  depthLimit,
  onTermClick,
  exploredTerms,
}: HighlightedTextProps) {
  if (!terms.length) return <span>{text}</span>;

  const validTerms = terms.filter(t => t.startIndex !== undefined && t.endIndex !== undefined) as {term: string; startIndex: number; endIndex: number}[];
  if (!validTerms.length) return <span>{text}</span>;

  const atLimit = depthLimit > 0 && depth >= depthLimit;
  const segments: React.ReactNode[] = [];
  let lastEnd = 0;

  const sorted = [...validTerms].sort((a, b) => a.startIndex - b.startIndex);
  for (const t of sorted) {
    if (t.startIndex > lastEnd) {
      segments.push(<span key={`t_${lastEnd}`}>{text.slice(lastEnd, t.startIndex)}</span>);
    }
    const explored = exploredTerms.has(t.term.toLowerCase());
    segments.push(
      atLimit ? (
        <span key={`term_${t.startIndex}`}>{t.term}</span>
      ) : (
        <span
          key={`term_${t.startIndex}`}
          onClick={(e) => { e.stopPropagation(); onTermClick(t.term, { x: e.clientX, y: e.clientY }); }}
          className={`
            relative cursor-pointer transition-all duration-200 group/term inline
            ${explored
              ? 'text-[#a078ff]/60 underline decoration-[#a078ff]/30 underline-offset-2'
              : 'text-[var(--accent)] underline decoration-[var(--accent)]/50 underline-offset-2 bg-violet-500/10 hover:bg-violet-500/20 hover:decoration-[var(--accent)]'
            }
          `}
        >
          {t.term}
          {!explored && (
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg
                            bg-[#171f33] text-[10px] text-[#dae2fd]/70 whitespace-nowrap opacity-0
                            group-hover/term:opacity-100 transition-opacity duration-200 border border-[#494454]/20 z-50">
              Click to explore →
            </span>
          )}
        </span>
      )
    );
    lastEnd = t.endIndex;
  }
  if (lastEnd < text.length) {
    segments.push(<span key={`t_${lastEnd}`}>{text.slice(lastEnd)}</span>);
  }

  return <>{segments}</>;
}
