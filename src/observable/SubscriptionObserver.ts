import { Observables } from '../definitions';
import { Action } from '../helpers';
import { prepare } from './helpers/prepare';
import { Subscription } from './Subscription';

const $done = Symbol('done');
const $transact = Symbol('transact');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any, R = void>
  implements Observables.SubscriptionObserver<T, R> {
  private [$done]: [boolean];
  private [$transact]: ReturnType<typeof prepare>;
  private [$subscription]: Subscription<T, R>;
  public constructor(
    observer: Observables.Observer<T, R>,
    subscription: Subscription<T, R>
  ) {
    this[$done] = [false];
    this[$transact] = prepare(observer, subscription, this[$done]);
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return this[$done][0] || this[$subscription].closed;
  }
  public next(value: T): void {
    return this[$transact](Action.Next, value);
  }
  public error(error: Error): void {
    return this[$transact](Action.Error, error);
  }
  public complete(reason: R): void {
    return this[$transact](Action.Complete, reason);
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
