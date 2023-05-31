import * as utils from "../../utils";

export function modal(element: HTMLDivElement) {
  element.classList.add("modal");
  return element;
}

export function modalBackground(element: HTMLDivElement) {
  element.classList.add("modal-background");
  return element;
}

export function modalContent(element: HTMLDivElement) {
  element.classList.add("modal-content");
  return element;
}

export function modalClose(element: HTMLButtonElement) {
  element.classList.add("modal-close");
  return element;
}

export function modalModal(content: Node[]) {
  const container = document.createElement("div");
  const background = document.createElement("div");
  background.addEventListener("click", () => {
    container.remove();
  });
  const close = document.createElement("button");
  close.addEventListener("click", () => {
    container.remove();
  });
  return utils.replaceChildren(modal(container), [
    modalBackground(background),
    utils.replaceChildren(modalContent(document.createElement("div")), content),
    modalClose(close),
  ]);
}
