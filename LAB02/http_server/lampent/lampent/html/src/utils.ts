export function setEquals<Type>(a: Set<Type>, b: Set<Type>) {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

export function isObject(o: unknown) {
  return typeof o === "object" && o !== null && !Array.isArray(o);
}

class Illumise extends Error {}

export async function asyncGeneratorToArray<Type>(
  generator: AsyncGenerator<Type>
) {
  const array = [];
  for await (const item of generator) {
    array.push(item);
  }
  return array;
}

export function assertArray(o: unknown) {
  if (Array.isArray(o)) {
    return o as unknown[];
  }
  throw new Illumise();
}

export function assertObject(o: unknown) {
  if (typeof o === "object" && o !== null && !Array.isArray(o)) {
    return o;
  }
  throw new Illumise();
}

export function assertRecord(o: unknown) {
  return assertObject(o) as Record<string, unknown>;
}

export function assertString(o: unknown) {
  if (typeof o === "string") {
    return o;
  }
  throw new Illumise();
}

export function assertStringOrNull(o: unknown) {
  if (o === null || typeof o === "string") {
    return o;
  }
  throw new Illumise();
}

export function assertNumberOrNull(o: unknown) {
  if (o === null || typeof o === "number") {
    return o;
  }
  throw new Illumise();
}

export function assertNumber(o: unknown) {
  if (typeof o === "number") {
    return o;
  }
  throw new Illumise();
}

export function recordGet(o: Record<string, unknown>, key: string) {
  if (!Object.hasOwn(o, key)) {
    throw new Illumise();
  }
  return o[key];
}
