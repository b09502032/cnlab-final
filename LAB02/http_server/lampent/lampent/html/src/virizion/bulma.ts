import * as morelull from "./morelull";
import * as virizion from "./virizion";

export class Tag extends virizion.Beedrill {
  constructor(public children: virizion.Virizion[]) {
    super();
  }
  build() {
    return new morelull.ContentSpan({
      children: this.children,
      classes: ["tag", "is-info"],
    });
  }
}

export class Image extends virizion.Beedrill {
  constructor(public children: virizion.Virizion[]) {
    super();
  }
  build() {
    return new morelull.FigureWithOptionalCaption({
      children: this.children,
      classes: ["image", "is-128x128"],
    });
  }
}

function pushClick(
  eventListeners: morelull.HTMLElementEventListener<"click">[],
  click: ((this: void) => void) | null
) {
  if (click !== null) {
    eventListeners.push({
      type: "click",
      callback: () => {
        click();
      },
    });
  }
  return eventListeners;
}

export class Button extends virizion.Beedrill {
  children: virizion.Virizion[];
  click: ((this: void) => void) | null;

  constructor(o: {
    children?: virizion.Virizion[];
    click?: (this: void) => void;
  }) {
    super();
    this.children = o.children ?? [];
    this.click = o.click ?? null;
  }

  build() {
    return new morelull.Button({
      children: this.children,
      classes: ["button", "is-primary"],
      eventListeners: pushClick([], this.click),
    });
  }
}

export class Delete extends virizion.Beedrill {
  click: ((this: void) => void) | null;

  constructor(o: { click?: (this: void) => void }) {
    super();
    this.click = o.click ?? null;
  }

  build() {
    return new morelull.Button({
      classes: ["delete"],
      eventListeners: pushClick([], this.click),
    });
  }
}

export class Notification extends virizion.Beedrill {
  children: virizion.Virizion[];
  deleteClick: ((this: void, self: Notification) => void) | null;

  constructor(o: {
    children?: virizion.Virizion[];
    deleteClick?: (this: void, self: Notification) => void;
  }) {
    super();
    this.children = o.children ?? [];
    this.deleteClick = o.deleteClick ?? null;
  }

  build(context: virizion.Context) {
    return new morelull.ContentDivision({
      children: [
        new Delete({
          click: () => {
            context.chimchar(this, null);
            if (this.deleteClick !== null) {
              this.deleteClick(this);
            }
          },
        }),
        ...this.children,
      ],
      classes: ["notification"],
    });
  }
}

export class Block extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["block"],
    });
  }
}

export class NavbarBurger extends virizion.Beedrill {
  active: boolean;
  click: ((this: void, self: NavbarBurger) => void) | null;

  constructor(o: {
    acitve?: boolean;
    click?: (this: void, self: NavbarBurger) => void;
  }) {
    super();
    this.active = o.acitve ?? false;
    this.click = o.click ?? null;
  }

  build() {
    const classes = ["navbar-burger"];
    if (this.active) {
      classes.push("is-active");
    }
    const eventListeners = [];
    const click = this.click;
    if (click !== null) {
      const type: keyof HTMLElementEventMap = "click";
      eventListeners.push({
        type: type,
        callback: () => {
          click(this);
        },
      });
    }
    return new morelull.Anchor({
      children: [
        new morelull.ContentSpan({}),
        new morelull.ContentSpan({}),
        new morelull.ContentSpan({}),
      ],
      classes: classes,
      eventListeners: eventListeners,
    });
  }
}

export class NavbarBrand extends virizion.Beedrill {
  constructor(
    public items: NavbarItem[],
    public hamburger: NavbarBurger | null
  ) {
    super();
  }

  build() {
    const children = [];
    children.push(...this.items);
    if (this.hamburger !== null) {
      children.push(this.hamburger);
    }
    return new morelull.ContentDivision({
      children: children,
      classes: ["navbar-brand"],
    });
  }
}

export class NavbarItemContentDivision extends virizion.Beedrill {
  constructor(public children: virizion.Virizion[]) {
    super();
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["navbar-item"],
    });
  }
}

export class NavbarItemAnchor extends virizion.Beedrill {
  constructor(
    public href: string | null,
    public children: virizion.Virizion[]
  ) {
    super();
  }

  build() {
    return new morelull.Anchor({
      href: this.href ?? null,
      children: this.children,
      classes: ["navbar-item"],
    });
  }
}

type NavbarItem = NavbarItemContentDivision | NavbarItemAnchor;

export class NavbarStart extends virizion.Beedrill {
  constructor(public children: NavbarItem[]) {
    super();
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["navbar-start"],
    });
  }
}

export class NavbarEnd extends virizion.Beedrill {
  constructor(public children: NavbarItem[]) {
    super();
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["navbar-end"],
    });
  }
}

export class NavbarMenu extends virizion.Beedrill {
  start: NavbarStart;
  end: NavbarEnd;
  active: boolean;

  constructor(o: { start: NavbarStart; end: NavbarEnd; active?: boolean }) {
    super();
    this.start = o.start;
    this.end = o.end;
    this.active = o.active ?? false;
  }

  build() {
    const classes = ["navbar-menu"];
    if (this.active) {
      classes.push("is-active");
    }
    return new morelull.ContentDivision({
      children: [this.start, this.end],
      classes: classes,
    });
  }
}

export class Navbar extends virizion.Beedrill {
  constructor(
    public brand: NavbarBrand | null,
    public menu: NavbarMenu | null
  ) {
    super();
  }

  build() {
    const children = [];
    if (this.brand !== null) {
      children.push(this.brand);
    }
    if (this.menu !== null) {
      children.push(this.menu);
    }
    return new morelull.NavigationSection({
      children: children,
      classes: ["navbar"],
    });
  }
}

export class Label extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.Label({ children: this.children, classes: ["label"] });
  }
}

class Corphish extends Error {}

export class Input extends virizion.Beedrill {
  type: string;
  value: string | null;

  constructor(o: { type: string; value?: string }) {
    super();
    this.type = o.type;
    this.value = o.value ?? null;
  }

  getValue(context: virizion.Context) {
    const node = context.ironBundle.node(this);
    if (node === undefined) {
      throw new Corphish();
    }
    if (node instanceof HTMLInputElement) {
      return node.value;
    }
    throw new Corphish();
  }

  build() {
    if (this.value === null) {
      return new morelull.Input({
        type: this.type,
        classes: ["input"],
      });
    } else {
      return new morelull.Input({
        type: this.type,
        value: this.value,
        classes: ["input"],
      });
    }
  }
}

export class Control extends virizion.Beedrill {
  children: (Input | Button)[];

  constructor(o: { children?: (Input | Button)[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["control"],
    });
  }
}

export class Help extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.Paragraph({
      children: this.children,
      classes: ["help"],
    });
  }
}

export class Field extends virizion.Beedrill {
  label: Label | null;
  controls: Control[];
  help: Help | null;
  grouped: boolean;

  constructor(o: {
    label?: Label;
    controls?: Control[];
    help?: Help;
    grouped?: boolean;
  }) {
    super();
    this.label = o.label ?? null;
    this.controls = o.controls ?? [];
    this.help = o.help ?? null;
    this.grouped = o.grouped ?? false;
  }

  build() {
    const children = [];
    if (this.label !== null) {
      children.push(this.label);
    }
    children.push(...this.controls);
    if (this.help !== null) {
      children.push(this.help);
    }
    const classes = ["field"];
    if (this.grouped) {
      classes.push("is-grouped");
    }
    return new morelull.ContentDivision({
      children: children,
      classes: classes,
    });
  }
}

export class FieldLabel extends virizion.Beedrill {
  label: Label | null;
  normal: boolean;

  constructor(o: { label?: Label; normal?: boolean }) {
    super();
    this.label = o.label ?? null;
    this.normal = o.normal ?? false;
  }

  build() {
    const children = [];
    if (this.label !== null) {
      children.push(this.label);
    }
    const classes = ["field-label"];
    if (this.normal) {
      classes.push("is-normal");
    }
    return new morelull.ContentDivision({
      children: children,
      classes: classes,
    });
  }
}

export class FieldBody extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["field-body"],
    });
  }
}

export class HorizontalField extends virizion.Beedrill {
  label: FieldLabel;
  body: FieldBody;

  constructor(o: { label: FieldLabel; body: FieldBody }) {
    super();
    this.label = o.label;
    this.body = o.body;
  }

  build() {
    return new morelull.ContentDivision({
      children: [this.label, this.body],
      classes: ["field", "is-horizontal"],
    });
  }
}

export class Section extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.GenericSection({
      children: this.children,
      classes: ["section"],
    });
  }
}

export class Table<
  EventType extends keyof HTMLElementEventMap
> extends virizion.Beedrill {
  top: morelull.TableHead<EventType> | null;
  content: morelull.TableBody<EventType>;

  constructor(o: {
    top?: morelull.TableHead<EventType>;
    content: morelull.TableBody<EventType>;
  }) {
    super();
    this.top = o.top ?? null;
    this.content = o.content;
  }

  build() {
    const children = [];
    if (this.top !== null) {
      children.push(this.top);
    }
    children.push(this.content);
    return new morelull.Table({ children: children, classes: ["table"] });
  }
}

export class TableContainer extends virizion.Beedrill {
  children: virizion.Virizion[];

  constructor(o: { children?: virizion.Virizion[] }) {
    super();
    this.children = o.children ?? [];
  }

  build() {
    return new morelull.ContentDivision({
      children: this.children,
      classes: ["table-container"],
    });
  }
}
