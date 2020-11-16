import { Empty } from '@definitions';

// TODO: modularize
export class TypeGuard {
  public static isUndefined(item: any): item is undefined {
    return item === undefined;
  }
  public static isNull(item: any): item is null {
    return item === null;
  }
  public static isEmpty(item: any): item is Empty {
    return this.isUndefined(item) || this.isNull(item);
  }
  public static isBoolean(item: any): item is boolean {
    return typeof item === 'boolean';
  }
  public static isString(item: any): item is string {
    return typeof item === 'string';
  }
  public static isNumber(item: any): item is number {
    return typeof item === 'number';
  }
  public static isSymbol(item: any): item is symbol {
    return typeof item === 'symbol';
  }
  public static isFunction(item: any): item is Function {
    return typeof item === 'function';
  }
  public static isObject(item: any): item is any {
    return typeof item === 'object' && item !== null;
  }
  public static isObjectLike(item: any): item is any {
    return this.isObject(item) || this.isFunction(item);
  }
  public static isArray(item: any): item is unknown[] {
    return Array.isArray(item);
  }
  public static isRecord(item: any): item is Record<any, unknown> {
    return this.isObject(item) && !this.isArray(item);
  }
  public static isPromiseLike(item: any): item is PromiseLike<unknown> {
    return this.isObject(item) && this.isFunction(item.then);
  }
  public static isPromise(item: any): item is Promise<unknown> {
    return (
      this.isObject(item) &&
      this.isFunction(item.then) &&
      this.isFunction(item.catch) &&
      this.isFunction(item.finally)
    );
  }
  public static isIterable(item: any): item is Iterable<unknown> {
    return this.isObject(item) && this.isFunction(item[Symbol.iterator]);
  }
}
