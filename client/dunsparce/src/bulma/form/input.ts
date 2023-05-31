export function input(element: HTMLInputElement, type: "text" | "password") {
  element.classList.add("input");
  element.type = type;
  return element;
}
