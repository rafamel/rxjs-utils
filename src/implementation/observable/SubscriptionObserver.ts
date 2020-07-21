import { SafeInternal } from '../helpers/safe-internal';
import { Subscription } from './Subscription';
import { Observables as Types } from '@definitions';

type SafeProperties<T> = SafeInternal<{
  observer: Types.Observer<T>;
  subscription: Subscription;
}>;

const map = new WeakMap();

export class SubscriptionObserver<T = any>
  implements Types.SubscriptionObserver<T> {
  private safe: SafeProperties<T>;
  public constructor(
    observer: Types.Observer<T>,
    subscription: Subscription<T>
  ) {
    this.safe = new SafeInternal(this, map, {
      observer,
      subscription
    });
  }
  public get closed(): boolean {
    const { subscription } = this.safe.get(map);
    return subscription.closed;
  }
  public next(value: T): void {
    if (this.closed) return;

    const { observer } = this.safe.get(map);
    if (observer.next) observer.next(value);
  }
  public error(error: Error): void {
    if (this.closed) return;

    const { observer, subscription } = this.safe.get(map);
    if (observer.error) observer.error(error);
    subscription.unsubscribe();
  }
  public complete(): void {
    if (this.closed) return;

    const { observer, subscription } = this.safe.get(map);

    if (observer.complete) observer.complete();
    subscription.unsubscribe();
  }
}
