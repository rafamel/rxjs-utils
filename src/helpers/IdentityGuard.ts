import { Empty } from '../definitions';

export class IdentityGuard {
  public static isFunction(item: any): item is Function {
    return typeof item === 'function';
  }
  public static isObject(item: any): boolean {
    return typeof item === 'object' && item !== null;
  }
  public static isEmpty(item: any): item is Empty {
    return item == null;
  }
}
