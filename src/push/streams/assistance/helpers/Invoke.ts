import { Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Subscription } from '../Subscription';
import { TalkbackOptions } from '../Talkback';
import { SubscriptionManager } from './SubscriptionManager';

const $empty = Symbol('empty');

export class Invoke {
  public static observer(
    action: 'start' | 'error' | 'complete',
    payload: any,
    subscription: Subscription,
    onUnhandledError: UnaryFn<Error>
  ): void {
    if (SubscriptionManager.isClosed(subscription)) {
      if (action === 'error') onUnhandledError(payload);
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
      if (!TypeGuard.isEmpty(method)) onUnhandledError(err);
      else if (action === 'error') onUnhandledError(payload);
    } finally {
      if (action !== 'start') {
        try {
          subscription.unsubscribe();
        } catch (err) {
          onUnhandledError(err);
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
