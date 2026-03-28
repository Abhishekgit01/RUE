import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useExplorationStore } from '../store/explorationStore';
import { useSessionStore } from '../store/sessionStore';
import { OutputPageHeader } from './OutputPageHeader';
import { NodeContent } from './NodeContent';
import { DivergenceConvergenceBar } from './DivergenceConvergenceBar';
import { LearningPathPanel } from './LearningPathPanel';
import clsx from 'clsx';

export function OutputPage() {
  const activeOutputNodeId = useExplorationStore((s) => s.activeOutputNodeId);
  const closeOutputPage = useExplorationStore((s) => s.closeOutputPage);
  const requestExplorationSummary = useSessionStore((s) => s.requestExplorationSummary);
  const node = useExplorationStore((s) =>
    activeOutputNodeId ? s.nodes[activeOutputNodeId] ?? null : null
  );
  const reduceMotion = useReducedMotion();

  const handleClose = useCallback(() => {
    const sessionId = useSessionStore.getState().activeSessionId;
    const n = Object.keys(useExplorationStore.getState().nodes).length;
    if (sessionId && n >= 3) requestExplorationSummary(sessionId);
    closeOutputPage();
  }, [closeOutputPage, requestExplorationSummary]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  useEffect(() => {
    if (!activeOutputNodeId) {
      document.body.style.overflow = '';
      return;
    }
    const desktop = window.matchMedia('(min-width: 768px)');
    const apply = () => {
      document.body.style.overflow = desktop.matches ? '' : 'hidden';
    };
    apply();
    desktop.addEventListener('change', apply);
    return () => {
      desktop.removeEventListener('change', apply);
      document.body.style.overflow = '';
    };
  }, [activeOutputNodeId]);

  return (
    <AnimatePresence>
      {activeOutputNodeId && node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[30] bg-[rgba(11,19,38,0.6)] backdrop-blur-[2px] max-md:bg-[#0b1326]"
            aria-hidden
          />

          <motion.div
            initial={reduceMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: '100%' }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 35 }
            }
            className={clsx(
              'fixed top-0 right-0 bottom-0 z-[40] flex flex-col',
              'w-full min-[768px]:max-w-none min-[768px]:w-[min(680px,100vw)]',
              'max-md:w-full'
            )}
            style={{
              background: '#0b1326',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <OutputPageHeader node={node} onClose={handleClose} />

            <div className="flex-1 overflow-y-auto px-6 min-[768px]:px-8 py-6 space-y-6 custom-scrollbar">
              <motion.div
                key={node.id}
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="space-y-6"
              >
                <DivergenceConvergenceBar nodeId={node.id} />
                <LearningPathPanel nodeId={node.id} />
                <NodeContent node={node} />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
