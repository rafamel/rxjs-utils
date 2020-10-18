import { isEmpty, isFunction } from './is';

export enum Action {
  Start,
  Next,
  Error,
  Complete
}

const map = {
  [Action.Start]: 'start',
  [Action.Next]: 'next',
  [Action.Error]: 'error',
  [Action.Complete]: 'complete'
};

export function invoke(
  record: Record<any, any>,
  action: Action,
  payload: any
): any {
  const name = map[action];
  const method: any = record[name];

  if (isEmpty(method)) {
    if (action === Action.Error) throw payload;
    else return;
  }

  if (isFunction(method)) {
    return method.call(record, payload);
  }

  throw new TypeError(`Expected ${name} to be a function`);
}
