import { motion } from 'framer-motion';
import { GitBranch, X } from 'lucide-react';
import clsx from 'clsx';

interface TermChipProps {
  term: string;
  isSelected: boolean;
  isExplored: boolean;
  isCustom?: boolean;
  onToggle: (term: string) => void;
  onRemove?: (term: string) => void;
}

export function TermChip({ term, isSelected, isExplored, isCustom, onToggle, onRemove }: TermChipProps) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(term);
      }}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'border transition-all duration-200 select-none cursor-pointer',
        isSelected
          ? 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)]'
          : isExplored && !isCustom
          ? 'bg-white/[0.03] border-white/[0.08] text-white/35 line-through'
          : isCustom
          ? 'border-dashed border-[var(--accent)]/30 text-white/60 bg-white/[0.03]'
          : 'bg-white/[0.05] border-white/[0.08] text-white/55 hover:border-[var(--accent)]/30 hover:text-white/75'
      )}
    >
      {/* Checkbox visual */}
      <span
        className={clsx(
          'w-3.5 h-3.5 rounded-[3px] flex items-center justify-center flex-shrink-0',
          'border transition-all duration-150',
          isSelected
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'border-white/20 bg-transparent'
        )}
      >
        {isSelected && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            width="8" height="8" viewBox="0 0 8 8" fill="none"
          >
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}
      </span>
      <span className="truncate max-w-[120px]">{term}</span>
      {isExplored && !isCustom && (
        <GitBranch className="w-2.5 h-2.5 opacity-50 ml-0.5" />
      )}
      {isCustom && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(term);
          }}
          className="ml-1 opacity-40 hover:opacity-80 p-0.5"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </motion.button>
  );
}
