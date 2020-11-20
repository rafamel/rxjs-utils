import { Push } from '@definitions';
import { PushStream } from '../stream';
import { intercept } from './intercept';
import { transform } from './transform';

export function operate<T, U = T>(
  operation: (talkback: Push.Talkback<U>) => Push.Hearback<T>
): Push.Operation<T, U> {
  return transform((stream) => {
    return new PushStream((tb) => {
      return intercept({ multicast: false }, stream, tb, operation(tb));
    });
  });
}
