import { Push } from '@definitions';
import { operate } from '../../utils/operate';
import { BinaryFn, TypeGuard } from 'type-core';
import { compare as isEqual } from 'equal-strategies';

/** @ignore */
const $empty = Symbol('empty');

export type CompareStrategy = 'strict' | 'shallow' | 'deep';

export function compare<T>(
  strategy?: CompareStrategy | BinaryFn<[T, T], boolean>
): Push.Operation<T> {
  const fn =
    !strategy || TypeGuard.isString(strategy)
      ? isEqual.bind(null, strategy || 'strict')
      : strategy;

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
