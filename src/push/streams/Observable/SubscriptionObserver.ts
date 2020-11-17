import { Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { Subscription } from './Subscription';
import { ManageObserver } from './helpers';

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

    const report = this[$report];
    const observer = ManageObserver.get(subscription);

    let method = $empty;
    try {
      (method = observer.next).call(observer, value);
    } catch (err) {
      TypeGuard.isEmpty(method) || report(err);
    }
  }
  public error(error: Error): void {
    const subscription = this[$subscription];
    if (ManageObserver.isClosed(subscription)) return;

    const report = this[$report];
    const observer = ManageObserver.get(subscription);

    ManageObserver.close(subscription);

    let method = $empty;
    try {
      (method = observer.error).call(observer, error);
    } catch (err) {
      report(TypeGuard.isEmpty(method) ? error : err);
    } finally {
      Handler.tries(subscription.unsubscribe.bind(subscription), report);
    }
  }
  public complete(): void {
    const subscription = this[$subscription];
    if (ManageObserver.isClosed(subscription)) return;

    const report = this[$report];
    const observer = ManageObserver.get(subscription);

    ManageObserver.close(subscription);

    let method = $empty;
    try {
      (method = observer.complete).call(observer);
    } catch (err) {
      TypeGuard.isEmpty(method) || report(err);
    } finally {
      Handler.tries(subscription.unsubscribe.bind(subscription), report);
    }
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
