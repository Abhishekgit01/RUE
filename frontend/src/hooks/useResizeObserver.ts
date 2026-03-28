import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        callback(entries[0]);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, callback]);
}
