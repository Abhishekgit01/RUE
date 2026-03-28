import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import clsx from 'clsx';
import { useExplorationStore } from '../store/explorationStore';
import { computeLearningPath } from '../features/rue/lib/learningPath';
import { truncateToSixWords } from '../features/rue/lib/analysis';

export function LearningPathPanel({ nodeId }: { nodeId: string }) {
  const nodes = useExplorationStore((s) => s.nodes);
  const switchOutputNode = useExplorationStore((s) => s.switchOutputNode);
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  const { orderedIds, prerequisites, nodeMetadata } = useMemo(
    () => computeLearningPath(nodes),
    [nodes]
  );

  const meta = nodeMetadata[nodeId];
  const nodePrereqs = useMemo(
    () =>
      [...prerequisites.filter((p) => p.nodeId === nodeId)].sort(
        (a, b) => b.confidence - a.confidence
      ),
    [prerequisites, nodeId]
  );

  const positionInPath = orderedIds.indexOf(nodeId) + 1;
  const totalNodes = orderedIds.length;

  if (totalNodes <= 1) return null;

  const myIndex = orderedIds.indexOf(nodeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5
                   hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <BookOpen className="w-4 h-4 text-[var(--accent)]/60 flex-shrink-0" />
          <span className="text-sm font-medium text-white/70 font-[Inter]">Learning Path</span>
          {meta && (
            <span
              className={clsx(
                'text-[10px] px-2 py-0.5 rounded-full border font-[Inter]',
                meta.isFoundational
                  ? 'bg-green-500/10 text-green-400/80 border-green-500/20'
                  : meta.complexity > 0.6
                    ? 'bg-red-500/10 text-red-400/80 border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400/80 border-amber-500/20'
              )}
            >
              {meta.isFoundational
                ? 'Start here'
                : meta.complexity > 0.6
                  ? 'Advanced'
                  : 'Intermediate'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-white/30 font-[Inter]">
            {positionInPath} / {totalNodes}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-white/30 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {nodePrereqs.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400/60 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-white/40 mb-1.5 font-[Inter]">
                Study these first for full context:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {nodePrereqs.map((p) => (
                  <button
                    key={`${p.nodeId}-${p.prereqId}-${p.reason}`}
                    type="button"
                    onClick={() => switchOutputNode(p.prereqId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               bg-amber-500/8 border border-amber-500/20 text-amber-400/80
                               text-[11px] hover:bg-amber-500/15 transition-colors font-[Inter]"
                  >
                    <span className="truncate max-w-[140px]">
                      {nodes[p.prereqId]?.summary ||
                        truncateToSixWords(nodes[p.prereqId]?.prompt ?? '')}
                    </span>
                    {p.overlappingTerms.length > 0 && (
                      <span className="text-amber-400/40 truncate max-w-[80px]">
                        ({p.overlappingTerms.slice(0, 2).join(', ')})
                      </span>
                    )}
                    <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-widest text-white/20 mt-3 mb-2 font-[Inter]">
                Recommended study order
              </p>
              <div className="space-y-1">
                {orderedIds.map((id, index) => {
                  const n = nodes[id];
                  const m = nodeMetadata[id];
                  const isCurrent = id === nodeId;
                  const isPast = myIndex >= 0 && index < myIndex;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => !isCurrent && switchOutputNode(id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left',
                        'transition-all duration-150',
                        isCurrent
                          ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-5 h-5 rounded-full flex items-center justify-center',
                          'text-[9px] font-bold flex-shrink-0',
                          isCurrent
                            ? 'bg-[var(--accent)] text-[#0b1326]'
                            : isPast
                              ? 'bg-white/15 text-white/50'
                              : 'bg-white/[0.05] text-white/25'
                        )}
                      >
                        {isPast ? '✓' : index + 1}
                      </span>

                      <span
                        className={clsx(
                          'text-xs flex-1 truncate font-[Inter]',
                          isCurrent ? 'text-[var(--accent)] font-medium' : 'text-white/45'
                        )}
                      >
                        {n?.summary || truncateToSixWords(n?.prompt ?? '')}
                      </span>

                      {m && !isCurrent && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background:
                              m.complexity > 0.6
                                ? '#f87171'
                                : m.complexity > 0.3
                                  ? '#fb923c'
                                  : '#4ade80',
                            opacity: 0.6,
                          }}
                          aria-hidden
                        />
                      )}

                      {isCurrent && (
                        <span className="text-[9px] text-[var(--accent)]/60 flex-shrink-0 font-[Inter]">
                          You are here
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
