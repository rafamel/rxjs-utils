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

    let res: any;
    let err: Error | void;
    let method: UnaryFn<T> | void;

    const subscription = this[$subscription];
    const observer = this[$observer];

    try {
      method = observer.next;
    } catch (e) {
      err = e;
    }

    if (!isEmpty(method)) {
      if (isFunction(method)) {
        try {
          res = method.call(observer, value);
        } catch (e) {
          err = e;
        }
      } else {
        err = new TypeError('Expected observer next to be a function');
      }
    }

    if (err) {
      try {
        subscription.unsubscribe();
      } finally {
        throw err;
      }
    }

    return res;
  }
  public error(error: Error): void {
    if (this.closed) throw error;

    this[$done] = true;

    let res: any;
    let err: Error | void;
    let method: UnaryFn<Error> | void;

    const subscription = this[$subscription];
    const observer = this[$observer];

    try {
      method = observer.error;
    } catch (e) {
      err = e;
    }

    if (isEmpty(method)) {
      err = error;
    } else {
      if (isFunction(method)) {
        try {
          res = method.call(observer, error);
        } catch (e) {
          err = e;
        }
      } else {
        err = new TypeError('Expected observer error to be a function');
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
  public complete(signal: S): void {
    if (this.closed) return;

    this[$done] = true;

    let res: any;
    let err: Error | void;
    let method: UnaryFn<S> | void;

    const subscription = this[$subscription];
    const observer = this[$observer];

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
