import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isSubscriptionLike } from '../../utils';

export class Parse {
  public static teardown(teardown: Push.Teardown): NoParamFn {
    if (TypeGuard.isFunction(teardown)) return teardown;
    if (TypeGuard.isEmpty(teardown)) return Handler.noop;
    if (isSubscriptionLike(teardown)) return () => teardown.unsubscribe();

    throw new TypeError(
      'Expected subscriber teardown to be a function or a subscription'
    );
  }
  public static hooks<T>(
    subscription: Push.Subscription,
    hooks?: Push.Hooks<T> | Empty
  ): [UnaryFn<Error>, UnaryFn<T>] {
    return !hooks
      ? [Handler.noop, Handler.noop]
      : [
          (error: Error): void => {
            const onUnhandledError = hooks.onUnhandledError;
            if (!onUnhandledError) return;
            onUnhandledError.call(hooks, error, subscription);
          },
          (value) => {
            const onStoppedNotification = hooks.onStoppedNotification;
            if (!onStoppedNotification) return;
            onStoppedNotification.call(hooks, value, subscription);
          }
        ];
  }
}
