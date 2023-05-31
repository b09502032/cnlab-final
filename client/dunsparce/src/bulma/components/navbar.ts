export function navbar(o: { element: HTMLElement; shadow?: boolean }) {
  o.element.classList.add("navbar");
  if (o.shadow === true) {
    o.element.classList.add("has-shadow");
  }
  return o.element;
}

export function navbarBrand(element: HTMLDivElement) {
  element.classList.add("navbar-brand");
  return element;
}

export function navbarBurger(element: HTMLAnchorElement) {
  element.classList.add("navbar-burger");
  return element;
}

export function navbarMenu(element: HTMLDivElement) {
  element.classList.add("navbar-menu");
  return element;
}

export function navbarStart(element: HTMLDivElement) {
  element.classList.add("navbar-start");
  return element;
}

export function navbarEnd(element: HTMLDivElement) {
  element.classList.add("navbar-end");
  return element;
}

export function navbarItem(o: {
  element: HTMLAnchorElement | HTMLDivElement;
  dropdown?: boolean;
  hoverable?: boolean;
}) {
  o.element.classList.add("navbar-item");
  if (o.dropdown === true) {
    o.element.classList.add("has-dropdown");
  }
  if (o.hoverable === true) {
    o.element.classList.add("is-hoverable");
  }
  return o.element;
}

export function navbarLink(o: {
  element: HTMLAnchorElement;
  arrowless?: boolean;
}) {
  o.element.classList.add("navbar-link");
  if (o.arrowless === true) {
    o.element.classList.add("is-arrowless");
  }
  return o.element;
}

export function navbarDropdown(o: {
  element: HTMLDivElement;
  right?: boolean;
}) {
  o.element.classList.add("navbar-dropdown");
  if (o.right === true) {
    o.element.classList.add("is-right");
  }
  return o.element;
}

export function toggleActive(element: HTMLDivElement) {
  if (element.classList.contains("is-active")) {
    element.classList.remove("is-active");
  } else {
    element.classList.add("is-active");
  }
}
