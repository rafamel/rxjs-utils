import { NoParamFn, WideRecord } from '../definitions';
import { capture } from './capture';
import { silence } from './silence';

export type Action = 'start' | 'next' | 'error' | 'complete' | 'terminate';

export function arbitrate(
  record: WideRecord,
  action: Action,
  payload: any,
  after: null | NoParamFn
): any {
  let res: any;

  try {
    const method = record[action];
    try {
      res = method.call(record, payload);
    } catch (err) {
      capture(action, method, err, action === 'error' ? [payload] : null);
    }
  } catch (err) {
    if (after) silence(() => after());
    throw err;
  }

  if (after) after();
  return res;
}
