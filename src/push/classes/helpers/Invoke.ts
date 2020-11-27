import { Empty, NoParamFn, Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Hooks, Subscription, TalkbackOptions } from '../assistance';
import { SubscriptionManager } from './SubscriptionManager';

const $empty = Symbol('empty');

export class Invoke {
  public static method<T extends object, K extends keyof T>(
    obj: T | Empty,
    key: K,
    payload?: Empty | any[],
    onEmpty?: Empty | NoParamFn
  ): void {
    if (!obj) return;
    let method: any = $empty;
    try {
      method = (obj as any)[key];
      payload ? method.call(obj, ...payload) : method.call(obj);
    } catch (err) {
      if (TypeGuard.isEmpty(method)) onEmpty && onEmpty();
      else throw err;
    }
  }
  public static observer(
    action: 'start' | 'error' | 'complete',
    payload: any,
    subscription: Subscription,
    hooks: Hooks
  ): void {
    if (SubscriptionManager.isClosed(subscription)) {
      if (action === 'error') hooks.onUnhandledError(payload, subscription);
      return;
    }

    const observer = SubscriptionManager.getObserver(subscription);
    if (action !== 'start') SubscriptionManager.close(subscription);

    try {
      this.method(
        observer,
        action,
        action === 'complete' ? null : [payload],
        action === 'error'
          ? () => hooks.onUnhandledError(payload, subscription)
          : null
      );
    } catch (err) {
      hooks.onUnhandledError(err, subscription);
    } finally {
      if (action !== 'start') {
        try {
          subscription.unsubscribe();
        } catch (err) {
          hooks.onUnhandledError(err, subscription);
        }
      }
    }
  }
  public static observers(
    action: keyof Push.Observer,
    payload: any,
    items: Push.Observer[],
    options: TalkbackOptions
  ): void {
    for (const item of items) {
      let method: any = $empty;
      try {
        method = item[action];
        method.call(item, payload);
      } catch (err) {
        if (TypeGuard.isEmpty(method)) continue;
        else if (options.onError) options.onError(err);
      }
      if (!options.multicast) break;
    }
  }
  public static subscriptionObservers(
    action: Exclude<keyof Push.SubscriptionObserver, 'closed'>,
    payload: any,
    items: Set<Push.SubscriptionObserver>
  ): void {
    for (const item of items) {
      item[action](payload);
    }
  }
}
