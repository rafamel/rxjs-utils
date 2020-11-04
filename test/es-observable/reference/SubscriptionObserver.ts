import { Observables } from '../../../src/definitions';
import { catches } from '../../../src/helpers';
import { Subscription } from './Subscription';
import {
  getSubscriptionObserver,
  isSubscriptionClosed,
  setSubscriptionClosed
} from './helpers';

const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any>
  implements Observables.SubscriptionObserver<T> {
  private [$subscription]: any;
  public constructor(subscription: Subscription<T>) {
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return isSubscriptionClosed(this[$subscription]);
  }
  public next(value: T): void {
    const subscription = this[$subscription];
    if (isSubscriptionClosed(subscription)) return;

    const observer = getSubscriptionObserver(subscription);
    catches(() => observer.next(value));
  }
  public error(error: Error): void {
    const subscription = this[$subscription];
    if (isSubscriptionClosed(subscription)) return;

    const observer = getSubscriptionObserver(subscription);
    setSubscriptionClosed(subscription);

    catches(() => observer.error(error));
    catches(() => subscription.unsubscribe());
  }
  public complete(): void {
    const subscription = this[$subscription];
    if (isSubscriptionClosed(subscription)) return;

    const observer = getSubscriptionObserver(subscription);
    setSubscriptionClosed(subscription);

    catches(() => observer.complete());
    catches(() => subscription.unsubscribe());
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
