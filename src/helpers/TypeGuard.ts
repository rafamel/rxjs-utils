import { Empty } from '@definitions';

// TODO: modularize
export class TypeGuard {
  public static isEmpty(item: any): item is Empty {
    return item == null;
  }
  public static isFunction(item: any): item is Function {
    return typeof item === 'function';
  }
  public static isObject(item: any): boolean {
    return typeof item === 'object' && item !== null;
  }
  public static isPromiseLike(item: any): item is PromiseLike<unknown> {
    return this.isObject(item) && this.isFunction(item.then);
  }
}
