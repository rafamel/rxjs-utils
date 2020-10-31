import { Core } from '../../../definitions';
import { isEmpty, isFunction, isObject } from '../../../helpers';

export function validateCounterpart(
  counterpart: Core.Counterpart<any, any, any, any>
): void {
  if (!isFunction(counterpart)) {
    throw new TypeError(`Expected Provider and Consumer to be functions`);
  }
}

export function validateHearback(hb?: Core.Hearback<any, any>): void {
  if (!isEmpty(hb) && !isObject(hb)) {
    throw new TypeError(`Expected Hearback to be an object`);
  }
}
