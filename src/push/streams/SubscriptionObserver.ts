import { Push } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { Subscription } from './Subscription';
import { ManageSubscription } from './helpers';

const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any> implements Push.SubscriptionObserver<T> {
  private [$subscription]: any;
  public constructor(subscription: Subscription<T>) {
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return ManageSubscription.isSubscriptionObserverClosed(this[$subscription]);
  }
  public next(value: T): void {
    const subscription = this[$subscription];
    if (ManageSubscription.isSubscriptionObserverClosed(subscription)) {
      return;
    }

    const observer = ManageSubscription.getSubscriptionObserver(subscription);

    let method: any = Handler.noop;
    try {
      (method = observer.next).call(observer, value);
    } catch (err) {
      if (TypeGuard.isEmpty(method)) return;

      const subscription = this[$subscription];
      const failure = ManageSubscription.getFailureManager(subscription);

      try {
        failure.fail(err, true);
      } catch (err) {
        Handler.catches(subscription.unsubscribe.bind(subscription));
        throw err;
      }
    }
  }
  public error(error: Error): void {
    const subscription = this[$subscription];
    const failure = ManageSubscription.getFailureManager(this[$subscription]);

    if (ManageSubscription.isSubscriptionObserverClosed(subscription)) {
      return failure.fail(error, true);
    }

    const observer = ManageSubscription.getSubscriptionObserver(subscription);

    ManageSubscription.closeSubscriptionObserver(subscription);

    let method: any = Handler.noop;
    try {
      (method = observer.error).call(observer, error);
    } catch (err) {
      if (TypeGuard.isEmpty(method)) failure.fail(error);
      else failure.fail(err);
    }

    try {
      subscription.unsubscribe();
    } catch (err) {
      failure.fail(err);
    }

    failure.raise();
  }
  public complete(): void {
    const subscription = this[$subscription];
    if (ManageSubscription.isSubscriptionObserverClosed(subscription)) {
      return;
    }

    const observer = ManageSubscription.getSubscriptionObserver(subscription);
    const failure = ManageSubscription.getFailureManager(this[$subscription]);

    ManageSubscription.closeSubscriptionObserver(subscription);

    let method: any = Handler.noop;
    try {
      (method = observer.complete).call(observer);
    } catch (err) {
      if (!TypeGuard.isEmpty(method)) failure.fail(err);
    }

    try {
      subscription.unsubscribe();
    } catch (err) {
      failure.fail(err);
    }

    failure.raise();
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
