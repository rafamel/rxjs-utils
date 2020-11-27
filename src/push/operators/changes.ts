import { BinaryFn, Push } from '@definitions';
import { operate } from '../utils';
import { compare as strategy } from 'equal-strategies';
import { TypeGuard } from '@helpers';

export type CompareStrategy = 'strict' | 'shallow' | 'deep';

const $empty = Symbol('empty');

export function changes<T>(
  compare?: CompareStrategy | BinaryFn<[T, T], boolean>
): Push.Operation<T> {
  const fn =
    !compare || TypeGuard.isString(compare)
      ? strategy.bind(null, compare || 'strict')
      : compare;

  return operate<T>((obs) => {
    let last: any = $empty;
    return {
      next(value: T): void {
        if (last === $empty || !fn(value, last)) {
          last = value;
          return obs.next(value);
        }
      }
    };
  });
}
