import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable } from '../classes/Observable';
import { transform } from './transform';
import { teardown } from './teardown';
import { intercept, InterceptOptions } from './intercept';

export type OperateOptions = InterceptOptions;
export type OperateObserverList<T> = [
  NoParamFn | Empty,
  UnaryFn<T> | Empty,
  UnaryFn<Error> | Empty,
  NoParamFn | Empty,
  Push.Teardown | Empty
];

export function operate<T, U = T>(
  operation: (
    observer: Push.SubscriptionObserver<U>
  ) => Push.Observer<T> | OperateObserverList<T>,
  options?: OperateOptions
): Push.Operation<T, U> {
  return transform((observable) => {
    return new Observable((obs: Push.SubscriptionObserver) => {
      const response = operation(obs);

      if (!TypeGuard.isArray(response)) {
        return intercept(observable, obs, response, options);
      }

      const subscription = intercept(
        observable,
        obs,
        {
          start: response[0] || undefined,
          next: response[1] || undefined,
          error: response[2] || undefined,
          complete: response[3] || undefined
        },
        options
      );
      return () => {
        subscription.unsubscribe();
        teardown(response[4])();
      };
    });
  });
}
