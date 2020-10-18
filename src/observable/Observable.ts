import { Subscription } from './Subscription';
import { Observables, UnaryFn } from '../definitions';
import { isFunction, isObject } from '../helpers';
import { fromIterable, fromObservableLike } from './helpers';
import SymbolObservable from 'symbol-observable';

const $subscriber = Symbol('subscriber');

export class Observable<T = any, S = void>
  implements Observables.Observable<T, S> {
  static of<T>(...items: T[]): Observables.Observable<T> {
    const Constructor = typeof this === 'function' ? this : Observable;
    return fromIterable(Constructor, items);
  }
  static from<T, S = void>(
    item:
      | Observables.Subscriber<T, S>
      | Observables.Observable<T, S>
      | Observables.Compatible<T, S>
      | Observables.Like<T>
      | Iterable<T>
  ): Observables.Observable<T, S> {
    const Constructor = isFunction(this) ? this : Observable;

    // Subscriber
    if (isFunction(item)) return new Constructor(item);

    if (isObject(item)) {
      const target: any = item;
      // Compatible
      const so = target[SymbolObservable];
      if (isFunction(so)) {
        const obs = so();
        if (!isObject(obs) && !isFunction(obs)) {
          throw new TypeError('Invalid Observable compatible object');
        }
        return fromObservableLike(Constructor, obs) as any;
      }

      // Like
      if (isFunction(target.subscribe)) {
        return fromObservableLike(Constructor, target) as any;
      }

      // Iterable
      if (isFunction(target[Symbol.iterator])) {
        return fromIterable(Constructor, target) as any;
      }
    }

    throw new TypeError(`Unable to convert ${typeof item} into an Observable`);
  }
  private [$subscriber]: Observables.Subscriber<T, S>;
  public constructor(subscriber: Observables.Subscriber<T, S>) {
    if (!isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    this[$subscriber] = (observer: Observables.SubscriptionObserver<T, S>) => {
      const unsubscribe = subscriber(observer);
      return unsubscribe || (() => undefined);
    };
  }
  public [SymbolObservable](): Observable<T, S> {
    return this;
  }
  public [Symbol.observable](): Observable<T, S> {
    return this;
  }
  public subscribe(
    observer: Observables.Observer<T, S>
  ): Observables.Subscription;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<S>
  ): Observables.Subscription;
  public subscribe(observer: any, ...arr: any[]): Observables.Subscription {
    if (isFunction(observer)) {
      observer = { next: observer, error: arr[0], complete: arr[1] };
    } else if (!isObject(observer)) {
      throw new TypeError('Expected observer to be an object or function');
    }

    return new Subscription(observer, this[$subscriber]);
  }
}
