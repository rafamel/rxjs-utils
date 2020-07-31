import { SafeInternal } from '../helpers/safe-internal';
import { Subscription, Observer, SubscriptionObserver } from '@definitions';

type SafeProperties<T> = SafeInternal<{
  observer: Observer<T>;
  subscription: Subscription;
}>;

const map = new WeakMap();

export class ObservableSubscriptionObserver<T = any>
  implements SubscriptionObserver<T> {
  private safe: SafeProperties<T>;
  public constructor(observer: Observer<T>, subscription: Subscription) {
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
