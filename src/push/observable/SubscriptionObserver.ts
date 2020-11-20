import { Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { Subscription } from './Subscription';
import { invoke, ManageObserver } from './helpers';

const $empty = Symbol('empty');
const $report = Symbol('report');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any> implements Push.SubscriptionObserver<T> {
  private [$report]: UnaryFn<Error>;
  private [$subscription]: Subscription;
  public constructor(
    subscription: Subscription<T>,
    ...report: [] | [UnaryFn<Error>]
  ) {
    this[$subscription] = subscription;
    this[$report] = report[0] ? report[0] : Handler.noop;
  }
  public get closed(): boolean {
    return ManageObserver.isClosed(this[$subscription]);
  }
  public next(value: T): void {
    const subscription = this[$subscription];
    if (ManageObserver.isClosed(subscription)) return;

    // Does not use invoke to increase performance
    const observer = ManageObserver.get(subscription);
    let method = $empty;
    try {
      (method = observer.next).call(observer, value);
    } catch (err) {
      if (!TypeGuard.isEmpty(method)) this[$report](err);
    }
  }
  public error(error: Error): void {
    invoke('error', error, this[$subscription], this[$report]);
  }
  public complete(): void {
    invoke('complete', undefined, this[$subscription], this[$report]);
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
