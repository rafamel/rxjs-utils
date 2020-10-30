import { NoParamFn, WideRecord } from '../definitions';
import { capture } from './capture';

export type ArbitrateAction =
  | 'start'
  | 'next'
  | 'error'
  | 'complete'
  | 'terminate';

export function arbitrate(
  record: WideRecord,
  action: ArbitrateAction,
  payload: any,
  onDone: NoParamFn | null
): any {
  let exec = false;
  try {
    const res = record[action](payload);
    exec = true;
    if (onDone) onDone();
    return res;
  } catch (err) {
    const fn = exec ? null : onDone;
    capture(record, action, err, action === 'error' ? [payload] : null, fn, fn);
  }
}
