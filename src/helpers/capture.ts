import { NoParamFn, UnaryFn } from '../definitions';
import { isEmpty, isFunction } from './is';

export function capture(
  method: any,
  name: string,
  error: Error,
  throwOnEmpty: null | [Error],
  onFail: UnaryFn<Error> | null,
  onFailDone: NoParamFn | null
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
        onFail(err);
      } catch (err) {
        try {
          if (onFailDone) onFailDone();
        } catch (_) {}
        throw err;
      }
      if (onFailDone) onFailDone();
    } else {
      try {
        if (onFailDone) onFailDone();
      } catch (_) {}
      throw err;
    }
  }
}
