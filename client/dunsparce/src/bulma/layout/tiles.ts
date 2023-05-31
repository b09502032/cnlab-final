export function tile(o: {
  element: HTMLDivElement;
  context?: Context;
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}) {
  o.element.classList.add("tile");
  const context = o.context;
  if (context !== undefined) {
    o.element.classList.add(context);
  }
  const size = o.size;
  if (size !== undefined) {
    o.element.classList.add(`is-${size}`);
  }
  return o.element;
}

export enum Context {
  ANCESTOR = "is-ancestor",
  PARENT = "is-parent",
  CHILD = "is-child",
}
