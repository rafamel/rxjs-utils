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
  let res: any;
  let method: any;

  try {
    res = (method = record[action]).call(record, payload);
  } catch (err) {
    capture(method, action, err, action === 'error' ? [payload] : null, onDone);
  }

  if (onDone) onDone();
  return res;
}
