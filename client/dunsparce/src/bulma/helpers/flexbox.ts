export function flex(o: { element: Element; alignItems?: AlignItems }) {
  o.element.classList.add("is-flex");
  const alignItems = o.alignItems;
  if (alignItems !== undefined) {
    o.element.classList.add(alignItems);
  }
  return o.element;
}

export enum AlignItems {
  CENTER = "is-align-items-center",
}
