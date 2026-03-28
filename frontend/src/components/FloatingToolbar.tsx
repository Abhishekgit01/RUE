import { Maximize } from 'lucide-react';
import { useExplorationStore } from '../store/explorationStore';

export default function FloatingToolbar() {
  const handleRecenter = () => {
    useExplorationStore.getState().fitAll();
  };

  return (
    <div className="fixed top-6 right-6 z-[25] flex items-center gap-3 max-md:hidden">
      <div className="h-10 flex items-center gap-1 bg-[#0b1326]/60 backdrop-blur-2xl border border-white/10 rounded-full px-1.5 shadow-2xl">
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors relative group"
          title="Recenter"
        >
          <Maximize size={16} />
          <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#0d1425] border border-white/10 text-[9px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Recenter
          </span>
        </button>
      </div>
    </div>
  );
}
