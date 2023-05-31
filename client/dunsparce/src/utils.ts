export function replaceChildren<T extends ParentNode>(node: T, nodes: Node[]) {
  node.replaceChildren(...nodes);
  return node;
}
