import { NoParamFn, Observables } from '../../../src/definitions';
import { TypeGuard, Handler } from '../../../src/helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import {
  isSubscriptionClosed,
  setSubscriptionObserver,
  setSubscriptionClosed
} from './helpers';

export const $teardown = Symbol('teardown');

class Subscription<T = any> implements Observables.Subscription {
  private [$teardown]: NoParamFn | null;
  public constructor(
    observer: Observables.Observer<T>,
    subscriber: Observables.Subscriber<T>
  ) {
    this[$teardown] = null;
    setSubscriptionObserver(this, observer);

    Handler.catches(() => (observer as any).start(this));
    if (isSubscriptionClosed(this)) return;

    const subscriptionObserver = new SubscriptionObserver(this);

    let teardown: NoParamFn = () => undefined;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      if (!TypeGuard.isEmpty(unsubscribe)) {
        if (TypeGuard.isFunction(unsubscribe)) {
          teardown = unsubscribe;
        } else if (
          TypeGuard.isObject(unsubscribe) &&
          TypeGuard.isFunction(
            (unsubscribe as Observables.Subscription).unsubscribe
          )
        ) {
          teardown = () => unsubscribe.unsubscribe();
        } else {
          throw new TypeError(
            'Expected subscriber teardown to be a function or a subscription'
          );
        }
      }
    } catch (err) {
      subscriptionObserver.error(err);
    }

    if (isSubscriptionClosed(this)) {
      try {
        teardown();
      } catch (_) {}
    } else {
      this[$teardown] = teardown;
    }
  }
  public get closed(): boolean {
    return isSubscriptionClosed(this);
  }
  public unsubscribe(): void {
    if (!isSubscriptionClosed(this)) setSubscriptionClosed(this);

    const teardown = this[$teardown];
    if (teardown) {
      Handler.catches(teardown);
      this[$teardown] = null;
    }
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
