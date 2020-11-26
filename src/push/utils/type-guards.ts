import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import 'symbol-observable';

export function isObservableLike(item: any): item is Push.Like<unknown> {
  return TypeGuard.isObject(item) && TypeGuard.isFunction(item.subscribe);
}

export function isObservableCompatible(
  item: any
): item is Push.Compatible<unknown> {
  return (
    TypeGuard.isObject(item) && TypeGuard.isFunction(item[Symbol.observable])
  );
}

export function isObservable(item: any): item is Push.Observable<unknown> {
  return (
    TypeGuard.isObject(item) &&
    TypeGuard.isFunction(item[Symbol.observable]) &&
    TypeGuard.isFunction(item.subscribe)
  );
}

export function isSource(item: any): item is Push.Source<unknown> {
  return (
    isObservableLike(item) ||
    isObservableCompatible(item) ||
    TypeGuard.isIterable(item) ||
    TypeGuard.isPromiseLike(item)
  );
}

export function isSubscriptionLike(item: any): item is Push.SubscriptionLike {
  return TypeGuard.isObject(item) && TypeGuard.isFunction(item.unsubscribe);
}

export function isSubscription(item: any): item is Push.Subscription {
  return (
    TypeGuard.isObject(item) &&
    TypeGuard.isBoolean(item.closed) &&
    TypeGuard.isFunction(item.unsubscribe)
  );
}
