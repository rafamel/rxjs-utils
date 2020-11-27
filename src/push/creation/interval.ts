import { Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable } from '../classes/Observable';

export interface IntervalOptions {
  every?: number;
  cancel?: UnaryFn<number, boolean> | PromiseLike<void>;
}

export function interval(
  every?: number | IntervalOptions
): Push.Observable<number> {
  const options = !every || TypeGuard.isNumber(every) ? { every } : every;

  const cancel = options.cancel;
  const promise = TypeGuard.isPromiseLike(cancel) ? cancel : null;
  const callback = TypeGuard.isFunction(cancel) ? cancel : null;

  return new Observable((obs) => {
    let index = -1;
    const interval = setInterval(() => {
      index++;
      obs.next(index);

      if (!callback) return;
      try {
        if (callback(index)) {
          obs.complete();
          clearInterval(interval);
        }
      } catch (err) {
        obs.error(err);
      }
    }, options.every || 0);

    if (promise) {
      promise.then(
        () => {
          clearInterval(interval);
          obs.complete();
        },
        (err) => {
          clearInterval(interval);
          obs.error(err);
        }
      );
    }

    return () => clearInterval(interval);
  });
}
