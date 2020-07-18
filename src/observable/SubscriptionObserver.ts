import { SubscriptionObserverSpec, Observer } from './definitions';
import { Internal } from '../helpers/Internal';
import { Subscription } from './Subscription';

const symbol = Symbol('internal');

type SubscriptionObserverInternal<T> = Internal<
  typeof symbol,
  {
    observer: Observer<T>;
    subscription: Subscription;
  }
>;

export class SubscriptionObserver<T = any>
  implements SubscriptionObserverSpec<T> {
  private internal: SubscriptionObserverInternal<T>;
  public constructor(observer: Observer<T>, subscription: Subscription<T>) {
    this.internal = new Internal(symbol, {
      observer,
      subscription
    });
  }
  public get closed(): boolean {
    const { subscription } = this.internal.get(symbol);
    return subscription.closed;
  }
  public next(value: T): void {
    if (this.closed) return;

    const { observer } = this.internal.get(symbol);
    if (observer.next) observer.next(value);
  }
  public error(error: Error): void {
    if (this.closed) return;

    const { observer, subscription } = this.internal.get(symbol);
    if (observer.error) observer.error(error);
    subscription.unsubscribe();
  }
  public complete(): void {
    if (this.closed) return;

    const { observer, subscription } = this.internal.get(symbol);

    if (observer.complete) observer.complete();
    subscription.unsubscribe();
  }
}
