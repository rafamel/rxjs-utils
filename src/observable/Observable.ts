import { Observables, UnaryFn } from '../definitions';
import { isFunction, isObject } from '../helpers';
import { fromIterable, fromObservableLike } from './from';
import { Subscription } from './Subscription';
import SymbolObservable from 'symbol-observable';

const $subscriber = Symbol('subscriber');

export class Observable<T = any, R = void>
  implements Observables.Observable<T, R> {
  static of<T>(...items: T[]): Observable<T> {
    const Constructor = typeof this === 'function' ? this : Observable;
    return fromIterable(Constructor, items) as any;
  }
  static from<T, R = void>(
    item:
      | Observables.Subscriber<T, R>
      | Observables.Observable<T, R>
      | Observables.Compatible<T, R>
      | Observables.Like<T>
      | Iterable<T>
  ): Observable<T, R> {
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
  private [$subscriber]: Observables.Subscriber<T, R>;
  public constructor(subscriber: Observables.Subscriber<T, R>) {
    if (!isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    this[$subscriber] = subscriber;
  }
  public [SymbolObservable](): Observable<T, R> {
    return this;
  }
  public [Symbol.observable](): Observable<T, R> {
    return this;
  }
  public subscribe(observer: Observables.Observer<T, R>): Subscription<T, R>;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<R>
  ): Subscription<T, R>;
  public subscribe(observer: any, ...arr: any[]): Subscription<T, R> {
    if (isFunction(observer)) {
      observer = { next: observer, error: arr[0], complete: arr[1] };
    } else if (!isObject(observer)) {
      throw new TypeError('Expected observer to be an object or function');
    }

    return new Subscription(observer, this[$subscriber]);
  }
}
