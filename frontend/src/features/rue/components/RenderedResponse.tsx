import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import type { ChatNode } from '../../../types';

export type RUENode = ChatNode;

type Segment =
  | { type: 'paragraph'; content: string }
  | { type: 'blockquote'; content: string }
  | { type: 'hr'; content: '' }
  | { type: 'list'; content: ''; items: string[] }
  | { type: 'code_block'; content: string; language: string; partial?: boolean };

const KNOWN_LANG = new Set([
  'python',
  'javascript',
  'typescript',
  'cpp',
  'c',
  'java',
  'rust',
  'go',
  'sql',
  'bash',
  'shell',
  'json',
  'text',
]);

function normalizeLanguage(lang: string): string {
  const l = lang.trim().toLowerCase() || 'text';
  return KNOWN_LANG.has(l) ? l : 'text';
}

/**
 * Block-level parse; tolerates incomplete fenced code while `isStreaming` is true.
 */
export function parseResponse(raw: string, isStreaming: boolean): Segment[] {
  const segments: Segment[] = [];
  if (!raw) return segments;

  const lines = raw.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '---') {
      segments.push({ type: 'hr', content: '' });
      i++;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const language = normalizeLanguage(line.trim().slice(3).trim() || 'text');
      i++;
      const codeLines: string[] = [];
      let closed = false;
      while (i < lines.length) {
        if (lines[i].trim().startsWith('```')) {
          closed = true;
          i++;
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      segments.push({
        type: 'code_block',
        content: codeLines.join('\n'),
        language,
        partial: !closed && isStreaming,
      });
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines = [line.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) {
        i++;
        quoteLines.push(lines[i].slice(2));
      }
      segments.push({ type: 'blockquote', content: quoteLines.join(' ') });
      i++;
      continue;
    }

    if (/^- .+/.test(line)) {
      const items = [line.slice(2).trimStart()];
      while (i + 1 < lines.length && /^- .+/.test(lines[i + 1])) {
        i++;
        items.push(lines[i].slice(2).trimStart());
      }
      segments.push({ type: 'list', content: '', items });
      i++;
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const paraLines = [line];
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      if (next.trim() === '') break;
      if (next.startsWith('> ')) break;
      if (/^- .+/.test(next)) break;
      if (next.trim().startsWith('```')) break;
      if (next.trim() === '---') break;
      i++;
      paraLines.push(lines[i]);
    }
    segments.push({ type: 'paragraph', content: paraLines.join(' ') });
    i++;
  }

  return segments;
}

function renderInline(
  text: string,
  onTermClick: (term: string) => void,
  exploredTerms: string[]
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /<term>(.*?)<\/term>|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={`t-${last}-${match.index}`}>{text.slice(last, match.index)}</span>);
    }

    if (match[1] !== undefined) {
      const term = match[1];
      const explored = exploredTerms.some((e) => e.toLowerCase() === term.toLowerCase());
      parts.push(
        <span
          key={`term-${match.index}`}
          data-term={term}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onTermClick(term);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTermClick(term);
            }
          }}
          className={clsx(
            'cursor-pointer transition-all duration-150 rounded-sm px-0.5',
            'border-b border-dashed',
            explored
              ? 'border-[var(--accent)] text-[var(--accent)] opacity-70'
              : 'border-[var(--accent)]/50 text-[var(--accent)]/90',
            'hover:border-[var(--accent)] hover:text-[var(--accent)]',
            'hover:bg-[var(--accent)]/8'
          )}
        >
          {term}
          {explored && <sup className="ml-0.5 text-[8px] opacity-50">✓</sup>}
        </span>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <code
          key={`ic-${match.index}`}
          className="px-1.5 py-0.5 rounded-md text-[0.85em] font-mono
                     bg-white/[0.08] text-white/80 border border-white/[0.08]"
        >
          {match[2]}
        </code>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-white/95">
          {match[3]}
        </strong>
      );
    } else if (match[4] !== undefined) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-white/75">
          {match[4]}
        </em>
      );
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(<span key="t-end">{text.slice(last)}</span>);
  }

  return parts;
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: '#3b82f6',
  javascript: '#f59e0b',
  typescript: '#60a5fa',
  cpp: '#ef4444',
  c: '#ef4444',
  java: '#f97316',
  rust: '#fb923c',
  go: '#22d3ee',
  sql: '#a78bfa',
  bash: '#4ade80',
  shell: '#4ade80',
  json: '#94a3b8',
  text: '#94a3b8',
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const langColor = LANGUAGE_COLORS[language.toLowerCase()] ?? '#94a3b8';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] my-1">
      <div
        className="flex items-center justify-between px-4 py-2
                      bg-white/[0.04] border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor }} />
          <span
            className="text-[11px] font-mono font-medium uppercase tracking-wider"
            style={{ color: langColor }}
          >
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-white/35
                     hover:text-white/60 transition-colors duration-150"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto bg-[#080f1f]">
        <pre className="px-5 py-4 text-[13px] font-mono leading-relaxed text-white/80 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function RenderedResponse({
  node,
  onTermClick,
  exploredTerms,
}: {
  node: RUENode;
  onTermClick: (term: string) => void;
  exploredTerms: string[];
}) {
  const reduceMotion = useReducedMotion();
  const segments = useMemo(
    () => parseResponse(node.response, node.isStreaming),
    [node.response, node.isStreaming]
  );

  return (
    <div className="space-y-4 text-[15px] font-[Inter] leading-[1.8] text-white/78">
      {segments.map((seg, idx) => {
        switch (seg.type) {
          case 'paragraph':
            return (
              <p key={idx} className="text-white/78">
                {renderInline(seg.content, onTermClick, exploredTerms)}
              </p>
            );
          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="relative pl-4 py-1 my-2 border-l-2 border-[var(--accent)]/40
                           text-white/55 italic text-[14px] leading-relaxed"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, var(--accent) 0%, transparent 100%)',
                    opacity: 0.4,
                  }}
                />
                {renderInline(seg.content, onTermClick, exploredTerms)}
              </blockquote>
            );
          case 'hr':
            return (
              <div key={idx} className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <div className="w-1 h-1 rounded-full bg-[var(--accent)]/30" />
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            );
          case 'list':
            return (
              <ul key={idx} className="space-y-1.5 pl-1">
                {(seg.items ?? []).map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span
                      className="mt-[0.6em] w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: 'var(--accent)', opacity: 0.5 }}
                    />
                    <span className="text-white/72">{renderInline(item, onTermClick, exploredTerms)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'code_block':
            return <CodeBlock key={idx} code={seg.content} language={seg.language} />;
          default:
            return null;
        }
      })}

      {node.isStreaming && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-[var(--accent)]/60 ml-0.5 align-middle rounded-sm"
          animate={reduceMotion ? { opacity: 0.85 } : { opacity: [1, 0.35, 1] }}
          transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 0.8 }}
        />
      )}
    </div>
  );
}
