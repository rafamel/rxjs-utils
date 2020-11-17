import { NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import { ManageObserver, teardownToFunction } from './helpers';

const $empty = Symbol('empty');
const $report = Symbol('report');
const $teardown = Symbol('teardown');

class Subscription<T = any> implements Push.Subscription {
  private [$report]: UnaryFn<Error>;
  private [$teardown]: NoParamFn | null;
  public constructor(
    observer: Push.Observer<T>,
    subscriber: Push.Subscriber<T>,
    ...report: [] | [UnaryFn<Error>]
  ) {
    this[$report] = report[0] ? report[0] : Handler.noop;
    this[$teardown] = null;
    ManageObserver.set(this, observer);

    const reports = this[$report];

    let method = $empty;
    Handler.tries(
      () => (method = (observer as any).start).call(observer, this),
      (err) => TypeGuard.isEmpty(method) || reports(err)
    );

    if (ManageObserver.isClosed(this)) return;

    const subscriptionObserver = new SubscriptionObserver(this, reports);

    let teardown: NoParamFn = Handler.noop;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      teardown = teardownToFunction(unsubscribe);
    } catch (err) {
      subscriptionObserver.error(err);
    } finally {
      if (ManageObserver.isClosed(this)) Handler.tries(teardown, reports);
      else this[$teardown] = teardown;
    }
  }
  public get closed(): boolean {
    return ManageObserver.isClosed(this);
  }
  public unsubscribe(): void {
    if (!ManageObserver.isClosed(this)) ManageObserver.close(this);

    const teardown = this[$teardown];
    if (!teardown) return;

    this[$teardown] = null;
    Handler.tries(teardown, this[$report]);
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
