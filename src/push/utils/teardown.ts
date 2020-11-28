import { Push } from '@definitions';
import { Handler } from '@helpers';
import { isSubscriptionLike } from './type-guards';
import { NullaryFn, TypeGuard } from 'type-core';

export function teardown(teardown: Push.Teardown): NullaryFn {
  if (TypeGuard.isFunction(teardown)) return teardown;
  if (TypeGuard.isEmpty(teardown)) return Handler.noop;
  if (isSubscriptionLike(teardown)) return () => teardown.unsubscribe();
  throw new TypeError('Expected teardown to be a function or a subscription');
}
