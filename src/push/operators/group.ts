import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { operate } from '../utils';

/**
 * @param every default: 2
 */
export function group<T>(every?: number): Push.Operation<T, T[]> {
  const number = TypeGuard.isEmpty(every) ? 2 : every;

  return operate<T, T[]>((obs) => {
    let arr: T[] = [];

    return {
      next(value: T): void {
        arr.push(value);
        if (arr.length >= number) {
          const response = arr;
          arr = [];
          obs.next(response);
        }
      }
    };
  });
}
