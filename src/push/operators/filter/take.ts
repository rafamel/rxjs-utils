import { Push } from '@definitions';
import { operate } from '../../utils/operate';
import { TypeGuard } from 'type-core';

export interface TakeOptions<T> {
  count?: number;
  while?: (value: T, index: number) => boolean;
}

export function take<T>(count: number | TakeOptions<T>): Push.Operation<T> {
  const options = !count || TypeGuard.isNumber(count) ? { count } : count;

  return operate<T>((obs) => {
    let index = -1;
    return {
      next(value: T): void {
        index++;

        if (options.count && index < options.count) {
          obs.next(value);
          return !options.while && index + 1 >= options.count
            ? obs.complete()
            : undefined;
        }

        if (options.while && options.while(value, index)) {
          return obs.next(value);
        }

        return obs.complete();
      }
    };
  });
}
