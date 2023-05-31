export function field(o: { element: HTMLDivElement; grouped?: Grouped }) {
  o.element.classList.add("field");
  const grouped = o.grouped;
  if (grouped !== undefined) {
    o.element.classList.add("is-grouped");
    const alignment = grouped.alignment;
    if (alignment !== undefined) {
      o.element.classList.add(`is-grouped-${alignment}`);
    }
    if (grouped.multiline === true) {
      o.element.classList.add("is-grouped-multiline");
    }
  }
  return o.element;
}

export interface Grouped {
  alignment?: "centered" | "right";
  multiline?: boolean;
}

export function label(element: HTMLLabelElement) {
  element.classList.add("label");
  return element;
}

export function control(element: HTMLDivElement) {
  element.classList.add("control");
  return element;
}
