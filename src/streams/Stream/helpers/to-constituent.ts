import { Core } from '../../../definitions';
import { Talkback } from '../Talkback';
import { validateCounterpart, validateHearback } from './validate';

/* Convert Counterpart to Constituent */
export function toConstituent<T, U>(
  counterpart: Core.Counterpart<T, U>
): Core.Constituent<T, U> {
  validateCounterpart(counterpart);

  return (exchange) => {
    return counterpart((hb) => {
      validateHearback(hb);

      const tb = exchange(
        new Talkback<T>(() => hb || {}, {
          afterTerminate: () => tb.terminate()
        })
      );
      return tb;
    });
  };
}
