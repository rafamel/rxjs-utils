import { Subscription } from './Subscription';
import { Observables, UnaryFn } from '../../definitions';
import { isEmpty, isFunction } from '../../helpers';

const $done = Symbol('done');
const $observer = Symbol('observer');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any, S = void>
  implements Observables.SubscriptionObserver<T, S> {
  private [$done]: boolean;
  private [$observer]: Observables.Observer<T, S>;
  private [$subscription]: Subscription<T, S>;
  public constructor(
    observer: Observables.Observer<T, S>,
    subscription: Subscription<T, S>
  ) {
    this[$observer] = observer;
    this[$subscription] = subscription;
    this[$done] = false;
  }
  public get closed(): boolean {
    return this[$done] || this[$subscription].closed;
  }
  public next(value: T): void {
    if (this.closed) return;

    const observer = this[$observer];
    if (observer.next) observer.next(value);
  }
  public error(error: Error): void {
    if (this.closed) return;

    this[$done] = true;
    try {
      const observer = this[$observer];
      if (observer.error) observer.error(error);
    } finally {
      this[$subscription].unsubscribe();
    }
  }
  public complete(signal: S): void {
    if (this.closed) return;

    this[$done] = true;
    const subscription = this[$subscription];
    const observer = this[$observer];

    let res: any;
    let err: Error | void;
    let method: UnaryFn<S> | void;

    try {
      method = observer.complete;
    } catch (e) {
      err = e;
    }

    if (!isEmpty(method)) {
      if (isFunction(method)) {
        try {
          res = method.call(observer, signal);
        } catch (e) {
          err = e;
        }
      } else {
        err = new TypeError('Expected observer complete to be a function');
      }
    }

    try {
      subscription.unsubscribe();
    } catch (e) {
      if (!err) err = e;
    }

    if (err) throw err;
    return res;
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
