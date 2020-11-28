import { NullaryFn } from 'type-core';

export class Accessor {
  public static define<T>(
    obj: object,
    key: string | number | symbol,
    value: T
  ): void {
    Object.defineProperty(obj, key, {
      enumerable: false,
      writable: true,
      value
    });
  }
  public static fallback<T>(
    obj: object,
    key: string | number | symbol,
    fn: NullaryFn<T>
  ): T {
    const response = (obj as any)[key];
    if (response !== undefined) return response;

    const value = fn();
    this.define(obj, key, value);
    return value;
  }
}
