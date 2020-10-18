import { SubscriptionObserver } from './SubscriptionObserver';
import { NopFn, Observables } from '../../definitions';
import { isFunction, isObject } from '../../helpers';

const $done = Symbol('done');
const $teardown = Symbol('teardown');

class Subscription<T = any, S = void> implements Observables.Subscription {
  private [$done]: boolean;
  private [$teardown]: NopFn | void;
  public constructor(
    observer: Observables.Observer<T, S>,
    subscriber: Observables.Subscriber<T, S>
  ) {
    this[$done] = false;

    try {
      if (observer.start) observer.start(this);
    } catch (err) {
      if (observer.error) observer.error(err);
      else throw err;
    }

    if (this.closed) return;

    const subscriptionObserver = new SubscriptionObserver(observer, this);

    let teardown: NopFn = () => undefined;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
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
