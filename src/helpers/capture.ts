import { NoParamFn, WideRecord } from '../definitions';
import { isEmpty, isFunction } from './is';

export type CaptureAction =
  | 'start'
  | 'next'
  | 'error'
  | 'complete'
  | 'terminate';

export function capture(
  record: WideRecord,
  action: CaptureAction,
  error: Error,
  throwOnEmpty: null | [Error],
  onPass: NoParamFn | null,
  onFail: NoParamFn | null
): void {
  try {
    const method = record[action];

    if (isEmpty(method)) {
      if (throwOnEmpty) throw throwOnEmpty[0];
    } else if (!isFunction(method)) {
      throw new TypeError(`Expected ${action} to be a function`);
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
