import { Core } from '../../../definitions';
import { TypeGuard } from '../../../helpers';

export function validateCounterpart(
  counterpart: Core.Counterpart<any, any>
): void {
  if (!TypeGuard.isFunction(counterpart)) {
    throw new TypeError(`Expected Provider and Consumer to be functions`);
  }
}

export function validateHearback(hb?: Core.Hearback<any>): void {
  if (!TypeGuard.isEmpty(hb) && !TypeGuard.isObject(hb)) {
    throw new TypeError(`Expected Hearback to be an object`);
  }
}
