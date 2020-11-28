import { Push } from '@definitions';
import { operate } from '../../utils/operate';

export function map<T, U>(
  projection: (value: T, index: number) => U
): Push.Operation<T, U> {
  return operate<T, U>((obs) => {
    let index = 0;
    return {
      next(value: T): void {
        obs.next(projection(value, index++));
      }
    };
  });
}
