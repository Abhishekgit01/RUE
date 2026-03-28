import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExplorationStore } from '../store/explorationStore';

export default function Minimap() {
  const { nodes, edges, camX, camY, openOutputPage } = useExplorationStore();
  const zoom = 1; // zoom removed in new model
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const nodeList = Object.values(nodes);

  const bounds = useMemo(() => {
    if (nodeList.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodeList.forEach(n => {
      const hw = 100;
      const hh = 50;
      if (n.x - hw < minX) minX = n.x - hw;
      if (n.x + hw > maxX) maxX = n.x + hw;
      if (n.y - hh < minY) minY = n.y - hh;
      if (n.y + hh > maxY) maxY = n.y + hh;
    });
    return {
      minX: minX - 400,
      maxX: maxX + 400,
      minY: minY - 400,
      maxY: maxY + 400,
    };
  }, [nodeList]);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  
  const mapWidth = 220;
  const mapHeight = 140;
  const scale = Math.min(mapWidth / width, mapHeight / height);
  
  const offsetX = (mapWidth - width * scale) / 2;
  const offsetY = (mapHeight - height * scale) / 2;

  const toMapX = (x: number) => (x - bounds.minX) * scale + offsetX;
  const toMapY = (y: number) => (y - bounds.minY) * scale + offsetY;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vX = -camX;
  const vY = -camY;
  const vW = vw / zoom;
  const vH = vh / zoom;

  if (nodeList.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[28] group max-md:hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[240px] h-[160px] bg-[#0b1326]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative pointer-events-auto cursor-crosshair"
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
          {/* Edges */}
          {edges.map(edge => {
            const from = nodes[edge.fromId];
            const to = nodes[edge.toId];
            if (!from || !to) return null;
            return (
              <line
                key={edge.id}
                x1={toMapX(from.x)}
                y1={toMapY(from.y)}
                x2={toMapX(to.x)}
                y2={toMapY(to.y)}
                stroke="var(--accent)"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Nodes */}
          {nodeList.map(n => (
            <motion.rect
              key={n.id}
              x={toMapX(n.x) - 4}
              y={toMapY(n.y) - 2.5}
              width={8}
              height={5}
              rx="1.5"
              fill="var(--accent)"
              initial={false}
              stroke="var(--accent)"
              strokeWidth={n.isFollowUp ? 1 : 0}
              strokeDasharray={n.isFollowUp ? "1,1" : "0"}
              animate={{ 
                opacity: hoveredNodeId === n.id ? 1 : 0.4,
                scale: hoveredNodeId === n.id ? 1.5 : 1
              }}
              onMouseEnter={() => setHoveredNodeId(n.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => openOutputPage(n.id)}
              className="cursor-pointer transition-[opacity,scale,stroke-width]"
            />
          ))}

          {/* Viewport Box */}
          <rect
            x={toMapX(vX - vW / 2)}
            y={toMapY(vY - vH / 2)}
            width={vW * scale}
            height={vH * scale}
            fill="var(--accent)"
            fillOpacity="0.03"
            stroke="var(--accent)"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            rx="3"
          />
        </svg>

        {/* Node Peek Overlay */}
        <AnimatePresence>
          {hoveredNodeId && nodes[hoveredNodeId] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-2 left-2 right-2 bg-white/5 backdrop-blur-md rounded-lg p-2 border border-white/5 pointer-events-none"
            >
              <p className="text-[9px] text-white/70 line-clamp-2 leading-relaxed italic">
                "{nodes[hoveredNodeId].prompt}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Label */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
          <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] text-white uppercase font-bold tracking-widest">Spatial Map</span>
        </div>
      </motion.div>
    </div>
  );
}
