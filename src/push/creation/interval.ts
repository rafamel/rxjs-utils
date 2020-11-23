import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { PushStream } from '../streams';

export interface IntervalOptions {
  every?: number;
  timeout?: number | PromiseLike<void>;
}

export function interval(
  every?: number | IntervalOptions
): Push.Stream<number> {
  const options = !every || TypeGuard.isNumber(every) ? { every } : every;

  return new PushStream((obs) => {
    let value = 0;
    const interval = setInterval(() => obs.next(value++), options.every || 0);

    let timeout: null | NodeJS.Timeout = null;
    if (options.timeout) {
      if (TypeGuard.isNumber(options.timeout)) {
        timeout = setTimeout(() => {
          clearInterval(interval);
          obs.complete();
        }, options.timeout);
      } else {
        options.timeout.then(
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
    }

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  });
}
