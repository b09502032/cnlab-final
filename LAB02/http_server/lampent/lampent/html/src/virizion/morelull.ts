import * as virizion from "./virizion";

interface EventListener {
  type: string;
  callback: (this: void, event: Event) => void;
  options?: AddEventListenerOptions;
}

export interface HTMLElementEventListener<K extends keyof HTMLElementEventMap> {
  type: K;
  callback: (this: void, event: HTMLElementEventMap[K]) => void;
  options?: AddEventListenerOptions;
}

export class Text extends virizion.Spewpa {
  data: string;
  eventListeners: EventListener[];

  constructor(o: { data: string; eventListeners?: EventListener[] }) {
    super();
    this.data = o.data;
    this.eventListeners = o.eventListeners ?? [];
  }

  render(context: virizion.Context) {
    const node = context.document.createTextNode(this.data);
    for (const eventListener of this.eventListeners) {
      node.addEventListener(
        eventListener.type,
        eventListener.callback,
        eventListener.options
      );
    }
    return node;
  }
}

abstract class Luvdisc extends virizion.Spewpa {
  abstract override render(context: virizion.Context): HTMLElement;
}

interface Hoothoot<K extends keyof HTMLElementEventMap> {
  classes?: string[];
  eventListeners?: HTMLElementEventListener<K>[];
}

interface Dondozo<K extends keyof HTMLElementEventMap> extends Hoothoot<K> {
  children?: virizion.Virizion[];
}

abstract class Breloom<
  Type extends HTMLElement,
  EventType extends keyof HTMLElementEventMap
> extends Luvdisc {
  children: virizion.Virizion[];
  classes: string[];
  eventListeners: HTMLElementEventListener<EventType>[];

  constructor(o: Dondozo<EventType>) {
    super();
    this.children = o.children ?? [];
    this.classes = o.classes ?? [];
    this.eventListeners = o.eventListeners ?? [];
  }

  abstract createNode(context: virizion.Context): Type;

  render(context: virizion.Context) {
    const element = this.createNode(context);
    if (!(element instanceof HTMLElement)) {
      throw new Error();
    }
    for (const child of this.children) {
      const node = context.render(child);
      element.appendChild(node);
    }
    if (this.classes.length !== 0) {
      element.classList.add(...this.classes);
    }
    for (const eventListener of this.eventListeners) {
      element.addEventListener(eventListener.type, eventListener.callback);
    }
    return element;
  }
}

export class Image<EventType extends keyof HTMLElementEventMap> extends Breloom<
  HTMLImageElement,
  EventType
> {
  src: string | null;

  constructor(o: { src?: string } & Hoothoot<EventType>) {
    super({ classes: o.classes ?? [] });
    this.src = o.src ?? null;
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("img");
  }

  override render(context: virizion.Context) {
    const element = super.render(context);
    if (this.src !== null) {
      element.src = this.src;
    }
    return element;
  }
}

export class Button<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLButtonElement, EventType> {
  constructor(dondozo: Dondozo<EventType>) {
    super({
      children: dondozo.children ?? [],
      classes: dondozo.classes ?? [],
      eventListeners: dondozo.eventListeners ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("button");
  }
}

export class NavigationSection<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLElement, EventType> {
  constructor(dondozo: Dondozo<EventType>) {
    super({
      children: dondozo.children ?? [],
      classes: dondozo.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("nav");
  }
}

export class ContentDivision<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLDivElement, EventType> {
  constructor(dondozo: Dondozo<EventType>) {
    super({
      children: dondozo.children ?? [],
      classes: dondozo.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("div");
  }
}

export class ContentSpan<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLSpanElement, EventType> {
  constructor(dondozo: Dondozo<EventType>) {
    super({
      children: dondozo.children ?? [],
      classes: dondozo.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("span");
  }
}

interface Weepinbell<K extends keyof HTMLElementEventMap> extends Dondozo<K> {
  href?: string | null;
}

export class Anchor<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLAnchorElement, EventType> {
  href: string | null;

  constructor(weepinbell: Weepinbell<EventType>) {
    super({
      children: weepinbell.children ?? [],
      classes: weepinbell.classes ?? [],
      eventListeners: weepinbell.eventListeners ?? [],
    });
    this.href = weepinbell.href ?? null;
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("a");
  }

  override render(context: virizion.Context) {
    const element = super.render(context);
    if (this.href !== null) {
      element.href = this.href;
    }
    return element;
  }
}

export class Label<EventType extends keyof HTMLElementEventMap> extends Breloom<
  HTMLLabelElement,
  EventType
> {
  constructor(dondozo: Dondozo<EventType>) {
    super({
      children: dondozo.children ?? [],
      classes: dondozo.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("label");
  }
}

export class Input<EventType extends keyof HTMLElementEventMap> extends Breloom<
  HTMLInputElement,
  EventType
> {
  type: string;
  value: string | null;

  constructor(o: { type: string; value?: string } & Hoothoot<EventType>) {
    super({
      classes: o.classes ?? [],
    });
    this.type = o.type;
    this.value = o.value ?? null;
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("input");
  }

  override render(context: virizion.Context) {
    const node = super.render(context);
    node.type = this.type;
    if (this.value !== null) {
      node.value = this.value;
    }
    return node;
  }
}

export class Paragraph<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLParagraphElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("p");
  }
}

export class FigureWithOptionalCaption<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("figure");
  }
}

export class GenericSection<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("section");
  }
}

export class PreformattedText<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLPreElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("pre");
  }
}

export class InlineCode<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("code");
  }
}

export class Table<EventType extends keyof HTMLElementEventMap> extends Breloom<
  HTMLTableElement,
  EventType
> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("table");
  }
}

export class TableHead<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLTableSectionElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("thead");
  }
}

export class TableBody<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLTableSectionElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("tbody");
  }
}

export class TableRow<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLTableRowElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("tr");
  }
}

export class TableHeader<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLTableCellElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("th");
  }
}

export class TableDataCell<
  EventType extends keyof HTMLElementEventMap
> extends Breloom<HTMLTableCellElement, EventType> {
  constructor(o: Dondozo<EventType>) {
    super({
      children: o.children ?? [],
      classes: o.classes ?? [],
    });
  }

  createNode(context: virizion.Context) {
    return context.document.createElement("td");
  }
}
