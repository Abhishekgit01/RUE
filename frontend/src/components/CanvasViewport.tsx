import { useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Maximize } from 'lucide-react';
import { useExplorationStore } from '../store/explorationStore';
import ChatNodeCard from './ChatNode';
import EdgeOverlay from './EdgeOverlay';
import { computeDivergenceScore } from '../features/rue/lib/analysis';

const BRANCH_COLORS = [
  '#d0bcff',
  '#7dd3fc',
  '#86efac',
  '#fbbf24',
  '#f472b6',
];

export default function CanvasViewport() {
  const nodes = useExplorationStore((s) => s.nodes);
  const activeOutputNodeId = useExplorationStore((s) => s.activeOutputNodeId);
  const openOutputPage = useExplorationStore((s) => s.openOutputPage);
  const camX = useExplorationStore((s) => s.camX);
  const camY = useExplorationStore((s) => s.camY);
  const panBy = useExplorationStore((s) => s.panBy);
  const setIsPanning = useExplorationStore((s) => s.setIsPanning);
  const isPanning = useExplorationStore((s) => s.isPanning);
  const fitAll = useExplorationStore((s) => s.fitAll);

  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const controls = useAnimation();

  const nodeList = useMemo(() => Object.values(nodes), [nodes]);

  const trends = useMemo(() => {
    const out: Record<string, 'diverging' | 'converging' | 'stable'> = {};
    for (const id of Object.keys(nodes)) {
      out[id] = computeDivergenceScore(id, nodes).trend;
    }
    return out;
  }, [nodes]);

  useEffect(() => {
    controls.start({
      x: camX,
      y: camY,
      scale: 1,
    });
  }, [camX, camY, controls]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    setIsPanning(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [setIsPanning]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return;
    panBy(dx, dy);
  }, [panBy]);

  const handlePointerUp = useCallback(() => {
    panStartRef.current = null;
    setIsPanning(false);
  }, [setIsPanning]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        animate={controls}
        transition={{
          type: 'tween',
          ease: 'circOut',
          duration: 0.5,
        }}
        className="absolute w-0 h-0"
        style={{
          left: '50%',
          top: '50%',
        }}
      >
        <EdgeOverlay />

        <AnimatePresence>
          {nodeList.map((node) => (
            <ChatNodeCard
              key={node.id}
              node={node}
              isActive={node.id === activeOutputNodeId}
              branchColor={BRANCH_COLORS[node.depth % BRANCH_COLORS.length]}
              divergenceTrend={trends[node.id] ?? 'stable'}
              onOpen={() => openOutputPage(node.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {nodeList.length > 0 && (
        <button
          type="button"
          onClick={() => fitAll()}
          className="fixed bottom-10 right-10 z-[22] w-12 h-12 flex items-center justify-center rounded-2xl
                     bg-[#131b2e]/80 backdrop-blur-xl border border-white/[0.08]
                     text-white/40 hover:text-[var(--accent)] hover:border-[var(--accent)]/30
                     shadow-2xl transition-all duration-200 max-md:bottom-24"
          title="Recenter Map"
        >
          <Maximize size={20} />
        </button>
      )}
    </div>
  );
}
