import { Empty, Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Parse } from '../helpers';
import { SubscriptionManager, Invoke } from './helpers';
import { Subscription } from './Subscription';

const $empty = Symbol('empty');
const $hooks = Symbol('hooks');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any> implements Push.SubscriptionObserver<T> {
  private [$hooks]: [UnaryFn<Error>, UnaryFn<T>];
  private [$subscription]: Subscription;
  public constructor(
    subscription: Subscription<T>,
    ...hooks: [] | [Push.Hooks<T> | Empty]
  ) {
    this[$hooks] = Parse.hooks(subscription, hooks[0]);
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return SubscriptionManager.isClosed(this[$subscription]);
  }
  public next(value: T): void {
    const subscription = this[$subscription];
    if (SubscriptionManager.isClosed(subscription)) return;

    // Does not use invoke to increase performance
    const observer = SubscriptionManager.getObserver(subscription);
    let method = $empty;
    try {
      (method = observer.next).call(observer, value);
    } catch (err) {
      if (!TypeGuard.isEmpty(method)) this[$hooks][0](err);
    }
  }
  public error(error: Error): void {
    Invoke.observer('error', error, this[$subscription], ...this[$hooks]);
  }
  public complete(): void {
    Invoke.observer(
      'complete',
      undefined,
      this[$subscription],
      ...this[$hooks]
    );
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
