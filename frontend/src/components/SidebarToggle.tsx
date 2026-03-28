import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';

export default function SidebarToggle() {
  const { sidebarOpen, setSidebarOpen } = useSessionStore();

  return (
    <motion.button
      initial={false}
      animate={{ 
        left: sidebarOpen ? 290 : 20,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="fixed top-6 z-[60] w-10 h-10 flex items-center justify-center bg-[#0b1326]/60 backdrop-blur-2xl border border-white/10 rounded-xl text-white/30 hover:text-[var(--accent)] hover:bg-[#0b1326]/80 transition-all shadow-2xl"
      title={sidebarOpen ? "Close Sidebar (Cmd+B)" : "Open Sidebar (Cmd+B)"}
    >
      {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
    </motion.button>
  );
}
