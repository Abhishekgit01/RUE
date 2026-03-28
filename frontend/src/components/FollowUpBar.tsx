import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface FollowUpBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const FollowUpBar = forwardRef<HTMLInputElement, FollowUpBarProps>(({ value, onChange, onSubmit }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      animate={{
        borderColor: isFocused
          ? 'rgba(208, 188, 255, 0.35)'
          : 'rgba(255, 255, 255, 0.07)',
      }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-white/[0.03] mt-4"
    >
      {/* Icon */}
      <MessageCircle className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />

      {/* Input */}
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Ask a follow-up question..."
        className="flex-1 bg-transparent outline-none text-sm text-white/70 placeholder:text-white/25 font-[Inter]"
      />

      {/* Submit button — appears when input has text */}
      <AnimatePresence>
        {value.trim() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              // Synthesize keyboard event for onSubmit handler
              onSubmit({
                key: 'Enter',
                preventDefault: () => {},
                stopPropagation: () => {},
              } as React.KeyboardEvent<HTMLInputElement>);
            }}
            className="w-6 h-6 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-150 flex-shrink-0"
          >
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FollowUpBar.displayName = 'FollowUpBar';
export default FollowUpBar;
