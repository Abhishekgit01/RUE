import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Settings2, MoreHorizontal, Edit2, Trash2, SearchX, Plus } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import type { SessionMeta } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatDistanceToNow } from 'date-fns';
import { truncateToSixWords } from '../features/rue/lib/analysis';

const getDepthColor = (depth: number) => {
  if (depth <= 2) return '#94a3b8'; // slate
  if (depth <= 4) return '#a78bfa'; // violet-400
  return 'var(--accent)'; // full accent
};

function RecentCard({ 
  session, 
  isActive, 
  onClick, 
  onUpdate, 
  onDelete 
}: { 
  session: SessionMeta; 
  isActive: boolean; 
  onClick: () => void;
  onUpdate: (updates: Partial<SessionMeta>) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== session.title) onUpdate({ title: editTitle.trim() });
    setIsEditing(false);
  };

  return (
    <div 
      className={`group relative rounded-xl cursor-pointer transition-all duration-150 p-3 mb-1
        ${isActive ? 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]/50' : 'hover:bg-white/[0.04]'}
      `}
      onClick={onClick}
      onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true); }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" 
          style={{ backgroundColor: getDepthColor(session.nodeCount) }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            {isEditing ? (
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                className="bg-black/40 text-white/90 text-sm px-1.5 py-0.5 rounded outline-none border border-[var(--accent)]/30 w-full"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <h3 
                onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="text-sm font-medium text-white/75 truncate leading-tight"
              >
                {session.title || truncateToSixWords(session.rootPrompt)}
              </h3>
            )}
            
            <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white/20 hover:text-white/50 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
              >
                <MoreHorizontal size={14} />
              </button>
              
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-[#0d1425] border border-white/10 rounded-lg shadow-2xl z-50 py-1 overflow-hidden"
                  >
                    <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white/90">
                      <Edit2 size={12} /> Rename
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400/60 hover:bg-red-400/10 hover:text-red-400">
                      <Trash2 size={12} /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-xs text-white/35 leading-relaxed line-clamp-2 mt-0.5 font-[Inter]">
            {session.explorationSummary || session.rootPrompt}
          </p>

          {session.nodeCount > 1 && (
            <p className="text-[10px] mt-1.5 font-[Inter]">
              <span className="text-[#7dd3fc] tabular-nums">
                {session.divergenceDiverging ?? 0} diverging
              </span>
              <span className="text-white/20"> · </span>
              <span className="text-[#86efac] tabular-nums">
                {session.divergenceConverging ?? 0} converging
              </span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="text-[10px] text-white/20 font-[Inter] tabular-nums">
              {session.nodeCount} nodes
            </span>
            {session.previewTerms?.slice(0, 3).map((term) => (
              <span
                key={term}
                className="text-[10px] px-1.5 py-0.5 rounded-full
                           bg-[var(--accent)]/8 text-[var(--accent)]/50 max-w-[72px] truncate font-[Inter]"
              >
                {term}
              </span>
            ))}
            <span className="text-[10px] text-white/25 whitespace-nowrap ml-auto font-[Inter]">
              {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }).replace('about ', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d1425]/95 z-[60] flex flex-col items-center justify-center p-2 rounded-xl border border-red-500/20"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] text-white/70 mb-2 font-medium">Delete exploration?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/50 hover:bg-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                className="px-2 py-1 rounded-md bg-red-500/20 text-[10px] text-red-400 hover:bg-red-500/30 font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { 
    sessions, activeSessionId, sidebarOpen, 
    searchQuery, setSearchQuery, fetchSessions,
    loadSession, updateSession, deleteSession
  } = useSessionStore();
  
  const { profile } = useSettingsStore();

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
    }, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const filteredSessions = sessions
    .filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.rootPrompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Function to handle clicking a session
  const handleSessionClick = async (sessionId: string) => {
    await loadSession(sessionId);
    // Component is likely already handling camera focus and pool mode in its useSessionStore
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      className="fixed top-0 left-0 h-full bg-[#0b1326] z-[50] flex flex-col border-r border-white/5 box-border"
      style={{ overflow: sidebarOpen ? 'visible' : 'hidden' }}
    >
      <div className="w-[280px] h-full flex flex-col">
        
        {/* New Chat Button */}
        <div className="px-4 pt-6 pb-2">
          <button 
            onClick={() => useSessionStore.getState().createSession('')}
            className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[#0b1326] rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            New Chat
          </button>
        </div>
        
        {/* Search Bar - Always visible in block */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent)]/50 transition-colors" />
            <input 
              type="text"
              placeholder="Search explorations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-8 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]/30 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-white/30"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Recents List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-4">
          <div className="px-2 mb-3">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/25">RECENTS</h2>
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <SearchX size={32} strokeWidth={1.5} />
              <p className="text-xs mt-2 font-medium">Nothing found</p>
            </div>
          ) : (
            filteredSessions.map(session => (
              <RecentCard 
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onClick={() => handleSessionClick(session.id)}
                onUpdate={(updates) => updateSession(session.id, updates)}
                onDelete={() => deleteSession(session.id)}
              />
            ))
          )}
        </div>

        {/* Profile Block (Pinned Bottom) */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between group/profile p-1 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[var(--accent)]/40 to-[#6d28d9]/40 border border-white/5 flex items-center justify-center">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white font-[Manrope]">
                    {profile?.displayName?.charAt(0).toUpperCase() || 'E'}
                  </span>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {profile?.displayName || 'Explorer'}
                  </p>
                  <button 
                    onClick={onOpenProfile}
                    className="p-1 rounded-md text-white/20 hover:text-[var(--accent)]/60 transition-colors"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
                <p className="text-[10px] text-white/35 truncate">
                  {profile?.tagline || `@${profile?.handle || 'user'}`}
                </p>
              </div>
            </div>

            <button 
              onClick={onOpenProfile}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
              title="Profile Settings"
            >
              <Settings2 size={15} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
