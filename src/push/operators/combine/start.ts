import { Push } from '@definitions';
import { Observable } from '../../classes/Observable';
import { transform } from '../../utils/transform';
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
          const subscription = observable.subscribe({
            next(value) {
              didEmit = true;
              obs.next(value);
            },
            error(err) {
              didEmit = true;
              obs.next(value);
              obs.error(err);
            },
            complete() {
              didEmit = true;
              obs.next(value);
              obs.complete();
            }
          });

          if (!didEmit) obs.next(value);

          return () => subscription;
        });
  });
}
