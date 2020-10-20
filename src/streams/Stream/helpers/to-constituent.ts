import { Core } from '../../../definitions';
import { isEmpty, isFunction, isObject } from '../../../helpers';
import { Talkback } from '../Talkback';

/* Convert Counterpart to Constituent */
export function toConstituent<T, TR, U, UR>(
  counterpart: Core.Counterpart<T, TR, U, UR>
): Core.Constituent<T, TR, U, UR> {
  if (!isFunction(counterpart)) {
    throw new TypeError(`Expected provider and consumer to be functions`);
  }
  return (exchange) => {
    return counterpart((partial) => {
      if (!isEmpty(partial) && !isObject(partial)) {
        throw new TypeError(`Expected listener to be an object`);
      }

      const tb = exchange(
        new Talkback(partial || {}, undefined, () => tb.terminate())
      );
      return tb;
    });
  };
}
