import { motion } from 'framer-motion';
import { useExplorationStore } from '../store/explorationStore';

const BRANCH_COLORS = [
  '#d0bcff', // accent (violet)
  '#7dd3fc', // sky
  '#86efac', // emerald
  '#fbbf24', // amber
  '#f472b6', // pink
];

const getBranchColor = (depth: number) => {
  return BRANCH_COLORS[depth % BRANCH_COLORS.length];
};

export default function EdgeLines() {
  const { edges, nodes } = useExplorationStore();

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ overflow: 'visible', left: 0, top: 0, width: 1, height: 1 }}
    >
      <defs>
        <style>
          {`
            @keyframes flow {
              from { stroke-dashoffset: 20; }
              to { stroke-dashoffset: 0; }
            }
            .edge-path {
              animation: flow 3s linear infinite;
            }
          `}
        </style>
      </defs>

      {edges.map((edge) => {
        const from = nodes[edge.fromId];
        const to = nodes[edge.toId];
        if (!from || !to) return null;

        // Approximate pill center offsets? Or side-to-side?
        // New pills are ~180px wide and ~80px tall.
        // Let's go FROM right-center TO left-center.
        
        const fromW = 180; // Estimated 
        const fromH = 60;  // Estimated

        const x1 = from.x + fromW; 
        const y1 = from.y + fromH / 2;
        
        const x2 = to.x;
        const y2 = to.y + fromH / 2;

        const dx = x2 - x1;
        const cp1x = x1 + dx * 0.4;
        const cp1y = y1;
        const cp2x = x1 + dx * 0.6;
        const cp2y = y2;

        const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        const color = getBranchColor(to.depth);

        return (
          <g key={edge.id} className="group/edge">
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={24}
              className="pointer-events-auto cursor-pointer"
            />
            
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={6}
              strokeOpacity={0.05}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
            
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeOpacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <motion.circle 
              cx={x1} cy={y1} r={3} 
              fill={color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
            <motion.circle 
              cx={x2} cy={y2} r={3} 
              fill={color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
