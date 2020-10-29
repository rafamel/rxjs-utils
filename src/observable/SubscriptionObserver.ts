import { Observables, WideRecord } from '../definitions';
import { Subscription } from './Subscription';
import { arbitrate, capture, silence } from '../helpers';

const $done = Symbol('done');
const $observer = Symbol('observer');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any, R = void>
  implements Observables.SubscriptionObserver<T, R> {
  private [$done]: boolean;
  private [$observer]: WideRecord;
  private [$subscription]: Subscription<T, R>;
  public constructor(
    observer: Observables.Observer<T, R>,
    subscription: Subscription<T, R>
  ) {
    this[$done] = false;
    this[$observer] = observer;
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return this[$done] || this[$subscription].closed;
  }
  public next(value: T): void {
    if (this.closed) return;

    // Replicate `arbitrate` for next (performance)
    try {
      const observer = this[$observer];
      const method = observer.next;
      try {
        return method.call(observer, value);
      } catch (err) {
        capture('next', method, err, null);
      }
    } catch (err) {
      silence(() => this[$subscription].unsubscribe());
      throw err;
    }
  }
  public error(error: Error): void {
    if (this.closed) throw error;

    this[$done] = true;
    return arbitrate(this[$observer], 'error', error, () => {
      this[$subscription].unsubscribe();
    });
  }
  public complete(reason: R): void {
    if (this.closed) return;

    this[$done] = true;
    return arbitrate(this[$observer], 'complete', reason, () => {
      this[$subscription].unsubscribe();
    });
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
