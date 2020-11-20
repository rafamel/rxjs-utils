import { Empty, Push, UnaryFn } from '@definitions';
import { PushStream } from '../stream';
import { intercept } from './intercept';
import { transform } from './transform';

export function operate<T>(
  operation: (talkback: Push.Talkback<T>) => Push.Hearback<T> | Empty
): Push.Operation<T, T>;

export function operate<T, U>(
  operation: (
    talkback: Push.Talkback<U>
  ) => Push.Hearback<T> & Record<'next', UnaryFn<T>>
): Push.Operation<T, U>;

export function operate(
  operation: (talkback: Push.Talkback) => Push.Hearback | Empty
): Push.Operation<any, any> {
  return transform((stream) => {
    return new PushStream((tb) => {
      return intercept(stream, tb, operation(tb), false);
    });
  });
}
