import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';

interface SelectionBubbleProps {
  text: string;
  rect: DOMRect;
  onAddToTray: (text: string) => void;
  onExploreNow: (text: string) => void;
  onDismiss: () => void;
}

export default function SelectionBubble({
  text, rect, onAddToTray, onExploreNow, onDismiss
}: SelectionBubbleProps) {
  // Position bubble above the selection
  const style = {
    position: 'fixed' as const,
    left: rect.left + rect.width / 2,
    top: rect.top - 8,
    transform: 'translate(-50%, -100%)',
    zIndex: 9999, // Ensure it's above everything
  };

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 6, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.85 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, duration: 0.15 }}
      className="flex items-center gap-1.5 px-2 py-2 rounded-xl
                 bg-[#0d1829] border border-white/[0.12]
                 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
      onMouseDown={e => e.preventDefault()} // Prevent click from dismissing immediately
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToTray(text);
          onDismiss();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-xs text-white/70 hover:text-white hover:bg-white/[0.08]
                   transition-all duration-150 whitespace-nowrap"
      >
        <Plus className="w-3.5 h-3.5" />
        Add to tray
      </button>

      <div className="w-px h-5 bg-white/[0.1]" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onExploreNow(text);
          onDismiss();
        }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg
                   text-xs text-[var(--accent)] hover:bg-[var(--accent)]/15
                   transition-all duration-150 font-medium whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Explore now
      </button>
    </motion.div>
  );
}
