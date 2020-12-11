import { Push } from '@definitions';
import { operate } from '../../utils/operate';

export interface Timestamp<T> {
  value: T;
  timestamp: number;
}

export function timestamp<T>(): Push.Operation<T, Timestamp<T>> {
  return operate<T, Timestamp<T>>((obs) => {
    return {
      next(value: T): void {
        obs.next({ value, timestamp: Date.now() });
      }
    };
  });
}
