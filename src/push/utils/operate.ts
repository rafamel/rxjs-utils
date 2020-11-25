import { Empty, Push } from '@definitions';
import { PushStream } from '../streams';
import { intercept, InterceptOptions } from './intercept';
import { transform } from './transform';

export type OperateOptions = InterceptOptions;

export function operate<T, U = T>(
  operation: (obs: Push.SubscriptionObserver<U>) => Push.Hearback<T> | Empty,
  options?: OperateOptions
): Push.Operation<T, U> {
  return transform((stream) => {
    return new PushStream((obs: Push.SubscriptionObserver) => {
      const hearback = operation(obs);
      return hearback
        ? intercept(stream, obs, hearback, options)
        : stream.subscribe(obs);
    });
  });
}
