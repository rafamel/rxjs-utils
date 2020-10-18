import { NoParamFn, Observables } from '../definitions';
import { isEmpty, isFunction, isObject, invoke, Action } from '../helpers';
import { SubscriptionObserver } from './SubscriptionObserver';

const $done = Symbol('done');
const $teardown = Symbol('teardown');

class Subscription<T = any, R = void> implements Observables.Subscription {
  private [$done]: boolean;
  private [$teardown]: NoParamFn | void;
  public constructor(
    observer: Observables.Observer<T, R>,
    subscriber: Observables.Subscriber<T, R>
  ) {
    this[$done] = false;

    try {
      invoke(observer, Action.Start, this);
    } catch (err) {
      invoke(observer, Action.Error, err);
    }

    if (this.closed) return;

    const subscriptionObserver = new SubscriptionObserver(observer, this);

    let teardown: NoParamFn = () => undefined;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      if (!isEmpty(unsubscribe)) {
        if (isFunction(unsubscribe)) {
          teardown = unsubscribe;
        } else if (
          isObject(unsubscribe) &&
          isFunction((unsubscribe as Observables.Subscription).unsubscribe)
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

    if (this.closed) teardown();
    else this[$teardown] = teardown;
  }
  public get closed(): boolean {
    return this[$done];
  }
  public unsubscribe(): void {
    if (this.closed) return;

    this[$done] = true;
    const teardown = this[$teardown];
    if (teardown) teardown();
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
