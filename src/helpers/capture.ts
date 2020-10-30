import { NoParamFn } from '../definitions';
import { isEmpty, isFunction } from './is';

export function capture(
  method: any,
  name: string,
  error: Error,
  throwOnEmpty: null | [Error],
  onPass: NoParamFn | null,
  onFail: NoParamFn | null
): void {
  try {
    if (isEmpty(method)) {
      if (throwOnEmpty) throw throwOnEmpty[0];
    } else if (!isFunction(method)) {
      throw new TypeError(`Expected ${name} to be a function`);
    } else {
      throw error;
    }
  } catch (err) {
    if (onFail) {
      try {
        onFail();
      } catch (_) {}
    }
    throw err;
  }

  if (onPass) {
    try {
      onPass();
    } catch (_) {}
  }
}
