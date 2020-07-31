import SymbolObservable from 'symbol-observable';
import { SafeInternal } from '../helpers/safe-internal';
import { Subscriber, Observer, Subscription, Observable } from '@definitions';
import { ObservableSubscription } from './Subscription';

type SafeProperties<T> = SafeInternal<{
  subscriber: Subscriber<T>;
}>;

const map = new WeakMap();

export class ObservableStream<T = any> implements Observable<T> {
  private safe: SafeProperties<T>;
  public constructor(subscriber: Subscriber<T>) {
    this.safe = new SafeInternal(this, map, { subscriber });
  }
  public ['@@observable'](): Observable<T> {
    return this;
  }
  public [SymbolObservable](): Observable<T> {
    return this;
  }
  public subscribe(observer: Observer<T>): Subscription;
  public subscribe(
    onNext: (value: T) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Subscription;
  public subscribe(
    a: Observer<T> | ((value: T) => void),
    b?: (error: Error) => void,
    c?: () => void
  ): Subscription {
    const { subscriber } = this.safe.get(map);

    return new ObservableSubscription(
      typeof a === 'function' ? { next: a, error: b, complete: c } : a,
      subscriber
    );
  }
}
