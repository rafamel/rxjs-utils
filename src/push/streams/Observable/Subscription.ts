import { NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { SubscriptionObserver } from './SubscriptionObserver';
import { ManageObserver, teardownToFunction } from './helpers';

const $empty = Symbol('empty');
const $report = Symbol('report');
const $callback = Symbol('callback');
const $teardown = Symbol('teardown');

class Subscription<T = any> implements Push.Subscription {
  private [$report]: UnaryFn<Error>;
  private [$callback]: NoParamFn;
  private [$teardown]: NoParamFn | null;
  public constructor(
    observer: Push.Observer<T>,
    subscriber: Push.Subscriber<T>,
    ...arr: [] | [UnaryFn<Error>] | [UnaryFn<Error>, NoParamFn]
  ) {
    this[$report] = arr[0] ? arr[0] : Handler.noop;
    this[$callback] = arr[1] ? arr[1] : Handler.noop;
    this[$teardown] = null;
    ManageObserver.set(this, observer);

    const report = this[$report];
    const callback = this[$callback];

    let method = $empty;
    Handler.tries(
      () => (method = (observer as any).start).call(observer, this),
      (err) => TypeGuard.isEmpty(method) || report(err)
    );

    if (ManageObserver.isClosed(this)) {
      callback();
      return;
    }

    const subscriptionObserver = new SubscriptionObserver(this, report);

    let teardown: NoParamFn = Handler.noop;
    try {
      const unsubscribe = subscriber(subscriptionObserver);
      teardown = teardownToFunction(unsubscribe);
    } catch (err) {
      subscriptionObserver.error(err);
    } finally {
      if (ManageObserver.isClosed(this)) {
        Handler.tries(teardown, report, callback);
      } else {
        this[$teardown] = teardown;
      }
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

    const report = this[$report];
    const callback = this[$callback];
    Handler.tries(teardown, report, callback);
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
