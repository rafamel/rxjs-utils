import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { operate } from '../utils';

export interface SkipOptions<T> {
  count?: number;
  while?: (value: T, index: number) => boolean;
}

export function skip<T>(count: number | SkipOptions<T>): Push.Operation<T> {
  const options = !count || TypeGuard.isNumber(count) ? { count } : count;

  return operate<T>((obs) => {
    let index = -1;
    let stop = false;
    return {
      next(value: T): void {
        index++;

        if (stop) return obs.next(value);
        if (options.count && index < options.count) return;
        if (options.while && options.while(value, index)) return;

        stop = true;
        return obs.next(value);
      }
    };
  });
}
