import { NoParamFn, Push } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isSubscriptionLike } from '../../utils/type-guards';

export function teardownFn(teardown: Push.Cleanup): NoParamFn {
  if (TypeGuard.isFunction(teardown)) return teardown;
  if (TypeGuard.isEmpty(teardown)) return Handler.noop;
  if (isSubscriptionLike(teardown)) return () => teardown.unsubscribe();

  throw new TypeError(
    'Expected subscriber teardown to be a function or a subscription'
  );
}
