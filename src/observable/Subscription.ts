import { Subscriber, Observer, SubscriptionSpec } from './definitions';
import { SubscriptionObserver } from './SubscriptionObserver';
import { Internal } from '../helpers/Internal';

const symbol = Symbol('internal');

type SubscriptionInternal = Internal<
  typeof symbol,
  {
    closed: boolean;
    unsubscribe: () => void;
  }
>;

export class Subscription<T = any> implements SubscriptionSpec {
  private internal: SubscriptionInternal;
  public constructor(observer: Observer<T>, subscriber: Subscriber<T>) {
    this.internal = new Internal(symbol, {
      closed: false,
      unsubscribe: () => undefined
    });

    try {
      if (observer.start) observer.start(this);
    } catch (err) {
      if (observer.error) observer.error(err);
      else throw err;
    }

    if (this.closed) return;

    const subscriptionObserver = new SubscriptionObserver(observer, this);

    try {
      const unsubscribe = subscriber(subscriptionObserver);
      this.internal.set(
        symbol,
        'unsubscribe',
        typeof unsubscribe === 'function'
          ? unsubscribe
          : () => unsubscribe.unsubscribe()
      );
    } catch (err) {
      subscriptionObserver.error(err);
    }
  }
  public get closed(): boolean {
    return this.internal.get(symbol, 'closed');
  }
  public unsubscribe(): void {
    const { unsubscribe } = this.internal.get(symbol);
    unsubscribe();

    this.internal.set(symbol, 'unsubscribe', () => null);
    this.internal.set(symbol, 'closed', true);
  }
}
