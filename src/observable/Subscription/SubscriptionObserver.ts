import { Subscription } from './Subscription';
import { Observables } from '../../definitions';

const $observer = Symbol('observer');
const $subscription = Symbol('subscription');

class SubscriptionObserver<T = any, S = void>
  implements Observables.SubscriptionObserver<T, S> {
  private [$observer]: Observables.Observer<T, S>;
  private [$subscription]: Subscription<T, S>;
  public constructor(
    observer: Observables.Observer<T, S>,
    subscription: Subscription<T>
  ) {
    this[$observer] = observer;
    this[$subscription] = subscription;
  }
  public get closed(): boolean {
    return this[$subscription].closed;
  }
  public next(value: T): void {
    if (this.closed) return;

    const observer = this[$observer];
    if (observer.next) observer.next(value);
  }
  public error(error: Error): void {
    if (this.closed) return;

    try {
      const observer = this[$observer];
      if (observer.error) observer.error(error);
    } finally {
      this[$subscription].unsubscribe();
    }
  }
  public complete(signal: S): void {
    if (this.closed) return;

    try {
      const observer = this[$observer];
      if (observer.complete) observer.complete(signal);
    } finally {
      this[$subscription].unsubscribe();
    }
  }
}

SubscriptionObserver.prototype.constructor = Object;

export { SubscriptionObserver };
