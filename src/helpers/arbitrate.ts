import { NoParamFn, UnaryFn, WideRecord } from '../definitions';
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
  onFail: UnaryFn<Error> | null,
  onDone: NoParamFn | null
): any {
  let run = false;
  let res: any;
  let method: any;

  try {
    res = (method = record[action]).call(record, payload);
  } catch (err) {
    capture(
      method,
      action,
      err,
      action === 'error' ? [payload] : null,
      onFail,
      () => {
        run = true;
        if (onDone) onDone();
      }
    );
  }

  if (!run && onDone) onDone();
  return res;
}
