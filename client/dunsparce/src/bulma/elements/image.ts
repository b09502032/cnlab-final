export function image(o: {
  element: HTMLElement;
  dimension?: 16 | 24 | 32 | 48 | 64 | 96 | 128;
}) {
  o.element.classList.add("image");
  const dimension = o.dimension;
  if (dimension !== undefined) {
    o.element.classList.add(`is-${dimension}x${dimension}`);
  }
  return o.element;
}
