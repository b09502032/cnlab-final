export function media(element: HTMLElement) {
  element.classList.add("media");
  return element;
}

export function mediaLeft(element: HTMLElement) {
  element.classList.add("media-left");
  return element;
}

export function mediaContent(element: HTMLDivElement) {
  element.classList.add("media-content");
  return element;
}

export function mediaRight(element: HTMLDivElement) {
  element.classList.add("media-right");
  return element;
}
