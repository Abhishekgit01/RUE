import { motion, useReducedMotion } from 'framer-motion';
import { GitBranch, GitMerge, Minus } from 'lucide-react';
import { useExplorationStore } from '../store/explorationStore';
import { computeDivergenceScore } from '../features/rue/lib/analysis';

export function DivergenceConvergenceBar({ nodeId }: { nodeId: string }) {
  const nodes = useExplorationStore((s) => s.nodes);
  const node = nodes[nodeId];
  const reduceMotion = useReducedMotion();

  const { score, label, description, trend } = computeDivergenceScore(nodeId, nodes);

  if (!node?.parentId) return null;

  const COLORS = {
    diverging: '#7dd3fc',
    converging: '#86efac',
    stable: 'var(--accent)',
  };
  const color = COLORS[trend];

  const needlePosition = ((score + 1) / 2) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {trend === 'diverging' && (
            <GitBranch className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          )}
          {trend === 'converging' && (
            <GitMerge className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          )}
          {trend === 'stable' && (
            <Minus className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          )}
          <span className="text-sm font-medium font-[Inter]" style={{ color }}>
            {label}
          </span>
        </div>
        <span className="text-xs text-white/35 font-[Inter]">{description}</span>
      </div>

      <div className="relative h-1.5 rounded-full bg-white/[0.08]">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full opacity-70"
          style={{
            background: 'linear-gradient(90deg, #86efac, var(--accent), #7dd3fc)',
          }}
          initial={false}
          animate={{ width: `${needlePosition}%` }}
          transition={
            reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }
          }
        />
        <motion.div
          className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-[#0b1326] z-10 shadow-lg"
          style={{
            background: color,
            transform: 'translate(-50%, -50%)',
          }}
          initial={false}
          animate={{ left: `${needlePosition}%` }}
          transition={
            reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }
          }
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-white/25 uppercase tracking-tighter">
          ← Converging
        </span>
        <span className="text-[10px] text-white/25 uppercase tracking-tighter">
          Diverging →
        </span>
      </div>
    </motion.div>
  );
}
