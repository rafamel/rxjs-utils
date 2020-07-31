import { ObservableSubscriptionObserver } from './SubscriptionObserver';
import { SafeInternal } from '../helpers/safe-internal';
import { Subscription, Observer, Subscriber } from '@definitions';

type SafeProperties = SafeInternal<{
  closed: boolean;
  unsubscribe: () => void;
}>;

const map = new WeakMap();

export class ObservableSubscription<T = any> implements Subscription {
  private safe: SafeProperties;
  public constructor(observer: Observer<T>, subscriber: Subscriber<T>) {
    this.safe = new SafeInternal(this, map, {
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

    const subscriptionObserver = new ObservableSubscriptionObserver(
      observer,
      this
    );

    try {
      const unsubscribe = subscriber(subscriptionObserver);
      this.safe.set(
        map,
        'unsubscribe',
        unsubscribe
          ? typeof unsubscribe === 'function'
            ? unsubscribe
            : () => unsubscribe.unsubscribe()
          : () => undefined
      );
    } catch (err) {
      subscriptionObserver.error(err);
    }
  }
  public get closed(): boolean {
    return this.safe.get(map, 'closed');
  }
  public unsubscribe(): void {
    const { unsubscribe } = this.safe.get(map);
    unsubscribe();

    this.safe.set(map, 'unsubscribe', () => null);
    this.safe.set(map, 'closed', true);
  }
}
