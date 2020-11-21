import { Push } from '@definitions';
import { PushStream } from '../streams';
import { intercept } from './intercept';
import { transform } from './transform';

export function operate<T, U = T>(
  operation: (observer: Push.SubscriptionObserver<U>) => Push.Hearback<T>
): Push.Operation<T, U> {
  return transform((stream) => {
    return new PushStream((tb) => {
      return intercept({ multicast: false }, stream, tb, operation(tb));
    });
  });
}
