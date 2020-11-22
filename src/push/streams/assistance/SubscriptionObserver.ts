import { Empty, Push } from '@definitions';
import { Accessor, TypeGuard } from '@helpers';
import { SubscriptionManager, Invoke } from '../helpers';
import { Subscription } from './Subscription';
import { Hooks } from './Hooks';

const $empty = Symbol('empty');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any> implements Push.SubscriptionObserver<T> {
  #hooks: Hooks<T>;
  private [$subscription]: Subscription<T>;
  public constructor(
    subscription: Subscription<T>,
    ...hooks: [] | [Push.Hooks<T> | Empty]
  ) {
    this.#hooks = new Hooks(hooks[0]);
    Accessor.define(this, $subscription, subscription);
  }
  public get closed(): boolean {
    return SubscriptionManager.isClosed(this[$subscription]);
  }
  public next(value: T): void {
    const subscription = this[$subscription];
    if (SubscriptionManager.isClosed(subscription)) {
      this.#hooks.onStoppedNotification(value, subscription);
      return;
    }

    // Does not use invoke to improve performance
    const observer = SubscriptionManager.getObserver(subscription);
    let method = $empty;
    try {
      (method = observer.next).call(observer, value);
    } catch (err) {
      if (!TypeGuard.isEmpty(method)) {
        this.#hooks.onUnhandledError(err, subscription);
      }
    }
  }
  public error(error: Error): void {
    Invoke.observer('error', error, this[$subscription], this.#hooks);
  }
  public complete(): void {
    Invoke.observer('complete', undefined, this[$subscription], this.#hooks);
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
