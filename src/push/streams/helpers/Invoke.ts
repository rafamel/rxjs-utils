import { Empty, Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Hooks, Subscription, TalkbackOptions } from '../assistance';
import { SubscriptionManager } from './SubscriptionManager';

const $empty = Symbol('empty');

export class Invoke {
  public static method<T extends object, K extends keyof T>(
    obj: T | Empty,
    key: K,
    ...payload: any[]
  ): void {
    if (!obj) return;
    const method = (obj as any)[key];
    if (!TypeGuard.isEmpty(method)) method.call(obj, ...payload);
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

    let method: any = $empty;
    try {
      method = observer[action];
      if (action === 'complete') method.call(observer);
      else method.call(observer, payload);
    } catch (err) {
      if (!TypeGuard.isEmpty(method)) {
        hooks.onUnhandledError(err, subscription);
      } else if (action === 'error') {
        hooks.onUnhandledError(payload, subscription);
      }
    } finally {
      if (action !== 'start') {
        hooks.onCloseSubscription(subscription);
        try {
          subscription.unsubscribe();
        } catch (err) {
          hooks.onUnhandledError(err, subscription);
        }
      }
    }
  }
  public static hearbacks(
    action: keyof Push.Hearback,
    payload: any,
    items: Set<Push.Hearback>,
    options: TalkbackOptions
  ): void {
    for (const item of items) {
      try {
        const method: any = item[action];
        if (TypeGuard.isEmpty(method)) continue;
        else method.call(item, payload);
      } catch (err) {
        if (options.report) options.report(err);
      }
      if (!options.multicast) break;
    }
  }
}
