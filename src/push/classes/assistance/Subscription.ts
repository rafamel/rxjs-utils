import { Empty, NoParamFn, Push } from '@definitions';
import { Handler } from '@helpers';
import { teardown } from '../../utils/teardown';
import { Invoke, SubscriptionManager } from '../helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import { Hooks } from './Hooks';

class Subscription<T = any> implements Push.Subscription {
  #teardown: NoParamFn | null;
  #hooks: Hooks<T>;
  public constructor(
    observer: Push.Observer<T>,
    subscriber: Push.Subscriber<T>,
    ...hooks: [] | [Push.Hooks<T> | Empty]
  ) {
    this.#teardown = null;
    this.#hooks = new Hooks(hooks[0]);
    SubscriptionManager.setObserver(this, observer);

    Invoke.observer('start', this, this, this.#hooks);
    if (SubscriptionManager.isClosed(this)) return;

    const subscriptionObserver = new SubscriptionObserver(this, hooks[0]);

    let fn: NoParamFn = Handler.noop;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      fn = teardown(unsubscribe);
    } catch (err) {
      subscriptionObserver.error(err);
    } finally {
      if (SubscriptionManager.isClosed(this)) {
        try {
          fn();
        } catch (err) {
          this.#hooks.onUnhandledError(err, this);
        }
      } else {
        this.#teardown = fn;
      }
    }
  }
  public get closed(): boolean {
    return SubscriptionManager.isClosed(this);
  }
  public unsubscribe(): void {
    if (!SubscriptionManager.isClosed(this)) {
      SubscriptionManager.close(this);
    }

    const teardown = this.#teardown;
    if (!teardown) return;

    this.#teardown = null;
    try {
      teardown();
    } catch (err) {
      this.#hooks.onUnhandledError(err, this);
    }
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
