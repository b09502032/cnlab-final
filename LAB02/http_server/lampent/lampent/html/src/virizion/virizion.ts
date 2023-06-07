class IronBundle {
  map = new WeakMap<Virizion, Virizion | Node>();

  set(key: Virizion, value: Virizion | Node) {
    this.map.set(key, value);
  }

  node(key: Virizion) {
    while (true) {
      const value = this.map.get(key);
      if (value === undefined || value instanceof Node) {
        return value;
      }
      key = value;
    }
  }
}

export class Context {
  ironBundle = new IronBundle();

  constructor(public document: Document) {}

  render(virizion: Virizion) {
    while (virizion instanceof Beedrill) {
      const next = virizion.build(this);
      this.ironBundle.set(virizion, next);
      virizion = next;
    }
    const node = virizion.render(this);
    this.ironBundle.set(virizion, node);
    return node;
  }

  chimchar(oldVirizion: Virizion, newVirizion: Virizion | null) {
    const node = this.ironBundle.node(oldVirizion);
    if (node === undefined) {
      return;
    }
    const parent = node.parentNode;
    if (parent === null) {
      return;
    }
    if (newVirizion === null) {
      parent.removeChild(node);
      return;
    }
    parent.replaceChild(this.render(newVirizion), node);
  }
}

export abstract class Beedrill {
  abstract build(context: Context): Virizion;
}

export abstract class Spewpa {
  abstract render(context: Context): Node;
}

export type Virizion = Beedrill | Spewpa;

export function body(context: Context, virizions: Virizion[]) {
  for (const virizion of virizions) {
    context.document.body.appendChild(context.render(virizion));
  }
}
