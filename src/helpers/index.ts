export function isFunction(item: any): item is Function {
  return typeof item === 'function';
}

export function isObject(item: any): boolean {
  return typeof item === 'object' && item !== null;
}

export function isEmpty(item: any): item is undefined | null | void {
  return item == null;
}
