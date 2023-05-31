export function size(element: Element, size: 1 | 2 | 3 | 4 | 5 | 6 | 7) {
  element.classList.add(`is-size-${size}`);
  return element;
}
