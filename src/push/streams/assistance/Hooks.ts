import { Empty, Push } from '@definitions';
import { Invoke } from '../helpers';

export class Hooks<T = any> implements Push.Hooks<T> {
  #hooks: Push.Hooks<T> | Empty;
  public constructor(hooks?: Push.Hooks<T> | Empty) {
    this.#hooks = hooks;
  }
  public onUnhandledError(error: Error, subscription: Push.Subscription): void {
    return Invoke.method(this.#hooks, 'onUnhandledError', error, subscription);
  }
  public onStoppedNotification(
    value: T,
    subscription: Push.Subscription
  ): void {
    try {
      Invoke.method(this.#hooks, 'onStoppedNotification', value, subscription);
    } catch (err) {
      this.onUnhandledError(err, subscription);
    }
  }
  public onCloseSubscription(subscription: Push.Subscription): void {
    try {
      Invoke.method(this.#hooks, 'onCloseSubscription', subscription);
    } catch (err) {
      this.onUnhandledError(err, subscription);
    }
  }
}
