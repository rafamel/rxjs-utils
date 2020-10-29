import { isEmpty, isFunction } from './is';

export function capture(
  name: string,
  method: any,
  error: Error,
  throwOnEmpty: null | [Error]
): void {
  if (isEmpty(method)) {
    if (throwOnEmpty) throw throwOnEmpty[0];
    else return;
  }
  if (!isFunction(method)) {
    throw new TypeError(`Expected ${name} to be a function`);
  }
  throw error;
}
