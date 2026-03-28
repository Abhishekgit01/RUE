import { useMemo } from 'react';
import { useExplorationStore } from '../store/explorationStore';
import type { ChatNode } from '../types';

export function useNodeAncestry(nodeId: string | null): ChatNode[] {
  const nodes = useExplorationStore(s => s.nodes);

  return useMemo(() => {
    if (!nodeId || !nodes[nodeId]) return [];

    const ancestry: ChatNode[] = [];
    let currentId: string | null = nodeId;

    while (currentId && nodes[currentId]) {
      const node: ChatNode = nodes[currentId];
      ancestry.unshift(node);
      currentId = node.parentId;
    }

    return ancestry;
  }, [nodeId, nodes]);
}
