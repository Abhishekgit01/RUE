import type { ChatNode } from '../types';

/**
 * Computes a learning path where children are prerequisites for parents.
 * Logic: A user should study the fundamental "terms" (leaves) before the "concepts" (roots).
 */
export function computeLearningPath(nodes: ChatNode[]): ChatNode[] {
  const visited = new Set<string>();
  const stack: ChatNode[] = [];

  const visit = (node: ChatNode) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // Get children
    const children = nodes.filter(n => n.parentId === node.id);
    
    // Reverse visit: process children first (Post-order traversal)
    children.forEach(visit);

    stack.push(node);
  };

  // Start with roots (nodes without parents)
  const roots = nodes.filter(n => !n.parentId);
  roots.forEach(visit);

  // stack is now [Prerequisite1, Prerequisite2, ..., Root]
  return stack;
}
