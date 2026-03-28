import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';

interface QueryInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  'What is LIME in AI?',
  'What is a transformer in deep learning?',
  'What is gradient descent?',
];

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [value, setValue] = useState('');
  const sidebarOpen = useSessionStore((s) => s.sidebarOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || isLoading) return;
    onSubmit(q);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 w-full max-w-4xl mx-auto relative z-10"
    >
      {/* CENTRAL BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* TOP-LEFT BRANDING - ANIMATED BY SIDEBAR */}
      <motion.div
        animate={{ 
          x: sidebarOpen ? 0 : 36,
          opacity: 1
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="absolute top-8 left-8 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-3 group">
          <span className="text-3xl font-black tracking-tighter text-white font-[Manrope] drop-shadow-[0_0_15px_rgba(208,188,255,0.4)]">
            Saiki
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-pulse" />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center max-w-2xl w-full px-4 relative z-10">
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white/90 font-[Manrope] tracking-tight leading-[1.1]">
            What do you want to<br />
            <span className="text-[var(--accent)] text-opacity-80">understand deeply?</span>
          </h1>
          <p className="text-sm md:text-base text-white/30 font-[Inter] tracking-wide">
            Click any highlighted term in the response to explore deeper.
          </p>
        </div>
      </div>

      {/* SEARCH INTERFACE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything... we'll help you truly understand it."
            disabled={isLoading}
            className="w-full h-16 px-8 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/10
                       text-lg text-white/90 placeholder:text-white/20
                       focus:outline-none focus:border-[var(--accent)]/30 focus:bg-white/[0.05]
                       transition-all duration-500 shadow-2xl"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full
                       bg-white/5 border border-white/10 flex items-center justify-center
                       text-white/40 hover:text-white/80 hover:bg-white/10 transition-all
                       disabled:opacity-20 disabled:cursor-not-allowed group-focus-within:border-[var(--accent)]/30 group-focus-within:text-[var(--accent)]/60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>

        {/* SUGGESTIONS */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {SUGGESTIONS.map((s, idx) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              onClick={() => { setValue(s); onSubmit(s); }}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold tracking-wide rounded-full bg-white/[0.03] text-white/30 border border-white/5
                         hover:bg-white/5 hover:text-white/60 hover:border-white/10 transition-all active:scale-95"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
