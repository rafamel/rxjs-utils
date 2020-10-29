import { NoParamFn } from '../definitions';

export function invoke(fn?: NoParamFn | null): void {
  if (fn) fn();
}
