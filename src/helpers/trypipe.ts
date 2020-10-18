import { NoParamFn } from '../definitions';

export type TryFn<T> = (error: any, value: T) => void;

export function trypipe<T>(fn: NoParamFn<T>, ...fns: Array<TryFn<T>>): T {
  let res: any;
  let err: any;

  try {
    res = fn();
  } catch (e) {
    err = e;
  }

  for (const fn of fns) {
    try {
      fn(err, res);
    } catch (e) {
      if (err === undefined) err = e;
    }
  }

  if (err !== undefined) throw err;
  return res;
}
