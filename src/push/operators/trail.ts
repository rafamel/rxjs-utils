import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { operate } from '../utils';

/**
 * @param count default: 2
 */
export function trail<T>(count?: number): Push.Operation<T, T[]> {
  const number = TypeGuard.isEmpty(count) ? 2 : count;

  return operate<T, T[]>((tb) => {
    const arr: T[] = [];
    return {
      next(value: T): void {
        arr.push(value);
        if (arr.length > number) arr.shift();
        if (arr.length === number) {
          tb.next(Array.from(arr));
        }
      }
    };
  });
}
