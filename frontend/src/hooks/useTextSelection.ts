import { useState, useEffect } from 'react';

export function useTextSelection(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [customSelection, setCustomSelection] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleDoubleClick(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('button, a')) return;

      const target = e.target as HTMLElement;
      if (target.dataset.term) {
        e.preventDefault();
        const term = target.dataset.term;
        if (term) {
          setCustomSelection(term);
          setSelectionRect(target.getBoundingClientRect());
        }
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      if (text.length < 2 || text.length > 60) return;
      if (text.includes('\n')) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setCustomSelection(text);
      setSelectionRect(rect);
    }

    el.addEventListener('dblclick', handleDoubleClick);
    return () => el.removeEventListener('dblclick', handleDoubleClick);
  }, [containerRef]);

  const clearSelection = () => {
    setCustomSelection(null);
    setSelectionRect(null);
  };

  return { customSelection, selectionRect, clearSelection };
}
