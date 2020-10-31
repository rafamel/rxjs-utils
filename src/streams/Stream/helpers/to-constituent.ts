import { Core } from '../../../definitions';
import { Talkback } from '../Talkback';
import { validateCounterpart, validateHearback } from './validate';

/* Convert Counterpart to Constituent */
export function toConstituent<T, TR, U, UR>(
  counterpart: Core.Counterpart<T, TR, U, UR>
): Core.Constituent<T, TR, U, UR> {
  validateCounterpart(counterpart);

  return (exchange) => {
    return counterpart((hb) => {
      validateHearback(hb);

      const tb = exchange(
        new Talkback<T, TR>(() => hb || {}, {
          afterTerminate: () => tb.terminate()
        })
      );
      return tb;
    });
  };
}
