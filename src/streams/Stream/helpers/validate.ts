import { Core } from '../../../definitions';
import { IdentityGuard } from '../../../helpers';

export function validateCounterpart(
  counterpart: Core.Counterpart<any, any>
): void {
  if (!IdentityGuard.isFunction(counterpart)) {
    throw new TypeError(`Expected Provider and Consumer to be functions`);
  }
}

export function validateHearback(hb?: Core.Hearback<any>): void {
  if (!IdentityGuard.isEmpty(hb) && !IdentityGuard.isObject(hb)) {
    throw new TypeError(`Expected Hearback to be an object`);
  }
}
