import { Push } from '@definitions';
import { operate } from '../utils';

export function map<T, U>(
  projection: (value: T, index: number) => U
): Push.Operation<T, U> {
  return operate<T, U>((tb) => {
    let index = 0;
    return {
      next(value: T): void {
        tb.next(projection(value, index++));
      }
    };
  });
}
