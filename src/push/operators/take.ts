import { Push } from '@definitions';
import { operate } from '../utils/operate';
import { TypeGuard } from 'type-core';

export interface TakeOptions<T> {
  count?: number;
  while?: (value: T, index: number) => boolean;
}

export function take<T>(count: number | TakeOptions<T>): Push.Operation<T> {
  const options = !count || TypeGuard.isNumber(count) ? { count } : count;

  return operate<T>((tb) => {
    let index = -1;
    let stop = false;
    return {
      next(value: T): void {
        if (stop) return;

        index++;
        if (options.count && index < options.count) {
          return tb.next(value);
        }
        if (options.while && options.while(value, index)) {
          return tb.next(value);
        }

        stop = true;
        return tb.complete();
      }
    };
  });
}
