import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { TypeGuard, Handler, FailureManager } from '@helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import { ManageSubscription } from './helpers';

const $teardown = Symbol('teardown');

class Subscription<T = any> implements Push.Subscription {
  private [$teardown]: NoParamFn | null;
  public constructor(
    observer: Push.Observer<T>,
    subscriber: Push.Subscriber<T>,
    ...reporter: [] | [Empty | UnaryFn<Error>]
  ) {
    const failure = new FailureManager(reporter[0] || Handler.noop);

    this[$teardown] = null;
    ManageSubscription.setSubscriptionObserver(this, observer);
    ManageSubscription.setFailureManager(this, failure);

    try {
      const start = observer.start;
      if (!TypeGuard.isEmpty(start)) start.call(observer, this);
    } catch (err) {
      failure.fail(err, true);
    }
    if (ManageSubscription.isSubscriptionObserverClosed(this)) return;

    const subscriptionObserver = new SubscriptionObserver(this);

    let teardown: NoParamFn = () => undefined;
    failure.disable();
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      if (!TypeGuard.isEmpty(unsubscribe)) {
        if (TypeGuard.isFunction(unsubscribe)) {
          teardown = unsubscribe;
        } else if (
          TypeGuard.isObject(unsubscribe) &&
          TypeGuard.isFunction((unsubscribe as Push.Subscription).unsubscribe)
        ) {
          teardown = () => unsubscribe.unsubscribe();
        } else {
          throw new TypeError(
            'Expected subscriber teardown to be a function or a subscription'
          );
        }
      }
    } catch (err) {
      // Will never throw as FailureManager is disabled
      subscriptionObserver.error(err);
    }

    if (
      failure.replete ||
      ManageSubscription.isSubscriptionObserverClosed(this)
    ) {
      try {
        teardown();
      } catch (err) {
        failure.fail(err);
      }
    } else {
      this[$teardown] = teardown;
    }

    failure.enable();
    failure.raise();
  }
  public get closed(): boolean {
    return ManageSubscription.isSubscriptionObserverClosed(this);
  }
  public unsubscribe(): void {
    if (!ManageSubscription.isSubscriptionObserverClosed(this)) {
      ManageSubscription.closeSubscriptionObserver(this);
    }

    const teardown = this[$teardown];
    if (teardown) {
      this[$teardown] = null;
      const failure = ManageSubscription.getFailureManager(this);
      try {
        teardown();
      } catch (err) {
        failure.fail(err, true);
      }
    }
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
