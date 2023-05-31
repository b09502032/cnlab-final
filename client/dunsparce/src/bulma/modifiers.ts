export function mainColor(
  element: Element,
  color: "primary" | "link" | "info" | "success" | "warning" | "danger"
) {
  element.classList.add(`is-${color}`);
  return element;
}
