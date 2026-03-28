import type { ChatNode } from '../types';

interface LayoutNode extends ChatNode {
  x: number;
  y: number;
  mod: number;
  parent?: LayoutNode;
  children: LayoutNode[];
}

const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 200;

export function calculateTreeLayout(nodes: ChatNode[]): Record<string, { x: number; y: number }> {
  if (nodes.length === 0) return {};

  const nodeMap = new Map<string, LayoutNode>();
  nodes.forEach(n => nodeMap.set(n.id, { ...n, x: 0, y: 0, mod: 0, children: [] }));

  let root: LayoutNode | null = null;
  nodes.forEach(n => {
    const layoutNode = nodeMap.get(n.id)!;
    if (n.parentId && nodeMap.has(n.parentId)) {
      nodeMap.get(n.parentId)!.children.push(layoutNode);
      layoutNode.parent = nodeMap.get(n.parentId);
    } else if (!n.parentId) {
      root = layoutNode;
    }
  });

  if (!root) return {};

  // First pass: Calculate initial X and Mod
  calculateInitialX(root);

  // Second pass: Calculate final X (adding Mod from parent)
  const finalPositions: Record<string, { x: number; y: number }> = {};
  calculateFinalPositions(root, 0, finalPositions);

  return finalPositions;
}

function calculateInitialX(node: LayoutNode) {
  node.children.forEach(calculateInitialX);

  if (node.children.length === 0) {
    // Leaf node
    const leftSibling = getLeftSibling(node);
    if (leftSibling) {
      node.x = leftSibling.x + HORIZONTAL_SPACING;
    } else {
      node.x = 0;
    }
  } else if (node.children.length === 1) {
    // Single child
    const leftSibling = getLeftSibling(node);
    if (leftSibling) {
      node.x = leftSibling.x + HORIZONTAL_SPACING;
      node.mod = node.x - node.children[0].x;
    } else {
      node.x = node.children[0].x;
    }
  } else {
    // Multiple children
    const leftSibling = getLeftSibling(node);
    const mid = (node.children[0].x + node.children[node.children.length - 1].x) / 2;

    if (leftSibling) {
      node.x = leftSibling.x + HORIZONTAL_SPACING;
      node.mod = node.x - mid;
    } else {
      node.x = mid;
    }
  }
}

function calculateFinalPositions(node: LayoutNode, modSum: number, results: Record<string, { x: number; y: number }>) {
  const depth = getDepth(node);
  const finalX = node.x + modSum;
  const finalY = depth * VERTICAL_SPACING;

  results[node.id] = { x: finalX, y: finalY };

  node.children.forEach(child => {
    calculateFinalPositions(child, modSum + node.mod, results);
  });
}

function getLeftSibling(node: LayoutNode): LayoutNode | null {
  if (!node.parent) return null;
  const idx = node.parent.children.indexOf(node);
  return idx > 0 ? node.parent.children[idx - 1] : null;
}

function getDepth(node: LayoutNode): number {
  let depth = 0;
  let curr = node;
  while (curr.parent) {
    depth++;
    curr = curr.parent;
  }
  return depth;
}
