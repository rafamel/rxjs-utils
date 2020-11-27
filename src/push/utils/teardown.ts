import { NoParamFn, Push } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isSubscriptionLike } from './type-guards';

export function teardown(teardown: Push.Teardown): NoParamFn {
  if (TypeGuard.isFunction(teardown)) return teardown;
  if (TypeGuard.isEmpty(teardown)) return Handler.noop;
  if (isSubscriptionLike(teardown)) return () => teardown.unsubscribe();
  throw new TypeError('Expected teardown to be a function or a subscription');
}
