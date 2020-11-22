import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler } from '@helpers';
import { Parse } from '../helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import { Invoke, SubscriptionManager } from './helpers';

class Subscription<T = any> implements Push.Subscription {
  #hooks: [UnaryFn<Error>, UnaryFn<T>];
  #teardown: NoParamFn | null;
  public constructor(
    observer: Push.Observer<T>,
    subscriber: Push.Subscriber<T>,
    ...hooks: [] | [Push.Hooks<T> | Empty]
  ) {
    this.#hooks = Parse.hooks(this, hooks[0]);
    this.#teardown = null;

    SubscriptionManager.setObserver(this, observer);

    Invoke.observer('start', this, this, this.#hooks[0]);
    if (SubscriptionManager.isClosed(this)) return;

    const subscriptionObserver = new SubscriptionObserver(this, hooks[0]);

    let teardown: NoParamFn = Handler.noop;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      teardown = Parse.teardown(unsubscribe);
    } catch (err) {
      subscriptionObserver.error(err);
    } finally {
      if (SubscriptionManager.isClosed(this)) {
        try {
          teardown();
        } catch (err) {
          this.#hooks[0](err);
        }
      } else {
        this.#teardown = teardown;
      }
    }
  }
  public get closed(): boolean {
    return SubscriptionManager.isClosed(this);
  }
  public unsubscribe(): void {
    if (!SubscriptionManager.isClosed(this)) SubscriptionManager.close(this);

    const teardown = this.#teardown;
    if (!teardown) return;

    this.#teardown = null;
    try {
      teardown();
    } catch (err) {
      this.#hooks[0](err);
    }
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
