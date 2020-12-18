import { Push } from '@definitions';
import { Observable } from '../../classes/Observable';
import { transform } from '../../utils/transform';
import { intercept } from '../../utils/intercept';
import { merge } from '../../creators/merge';

export type StartStrategy = 'always' | 'no-emit';

export function start<T, U>(
  value: U,
  strategy?: StartStrategy
): Push.Operation<T, T | U> {
  const always = strategy !== 'no-emit';

  return transform((observable) => {
    return always
      ? merge(Observable.of(value), observable)
      : new Observable((obs) => {
          let didEmit = false;
          const subscription = intercept(observable, obs, {
            next(value) {
              didEmit = true;
              obs.next(value);
            }
          });

          if (!didEmit) obs.next(value);

          return () => subscription;
        });
  });
}
