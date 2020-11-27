import { Push } from '@definitions';
import { operate } from '../utils/operate';

export function filter<T>(
  predicate: (value: T, index: number) => boolean
): Push.Operation<T> {
  return operate<T>((obs) => {
    let index = 0;
    return {
      next(value: T): void {
        if (predicate(value, index++)) {
          obs.next(value);
        }
      }
    };
  });
}
