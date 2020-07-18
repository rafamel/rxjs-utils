import SymbolObservable from 'symbol-observable';
import {
  Subscriber,
  ObservableSpec,
  Observer,
  CompatibleObservableSpec
} from './definitions';
import { Internal } from '../helpers/Internal';
import { Subscription } from './Subscription';

const symbol = Symbol('internal');

type ObservableInternal<T> = Internal<
  typeof symbol,
  {
    subscriber: Subscriber<T>;
  }
>;

export class Observable<T = any>
  implements AsyncIterable<T>, ObservableSpec<T> {
  public static of<T>(...items: T[]): Observable<T> {
    return Observable.from(items);
  }
  public static from<T>(
    item: ObservableSpec<T> | CompatibleObservableSpec<T> | Iterable<T>
  ): Observable<T> {
    const value: any = item;

    if (typeof value === 'object' && value !== null) {
      // Observables
      if (value instanceof Observable) {
        return value;
      }

      const fn: any = value[SymbolObservable] || value['@@observable'];
      if (typeof fn === 'function') {
        const result = fn.call(value);
        return result instanceof Observable
          ? result
          : new Observable((obs) => result.subscribe(obs));
      }

      // Iterables
      if (typeof value[Symbol.iterator] === 'function') {
        return new Observable((obs) => {
          try {
            for (const item of value) {
              obs.next(item);
            }
            obs.complete();
          } catch (e) {
            obs.error(e);
          }
          return () => undefined;
        });
      }
    }

    throw new Error(
      'Invalid type: must receive an Observable or Iterable object'
    );
  }
  private internal: ObservableInternal<T>;
  public constructor(subscriber: Subscriber<T>) {
    this.internal = new Internal(symbol, { subscriber });
  }
  public ['@@observable'](): Observable<T> {
    return this;
  }
  public [SymbolObservable](): Observable<T> {
    return this;
  }
  // TODO
  public async *[Symbol.asyncIterator]() {
    // let i = 0;
    // const length = toLength((<ArrayLike<TSource>>this._source).length);
    // while (i < length) {
    //   yield await this._selector(this._source[i], i++);
    // }
  }
  public subscribe(observer: Observer<T>): Subscription<T>;
  public subscribe(
    onNext: (value: T) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Subscription<T>;
  public subscribe(
    a: Observer<T> | ((value: T) => void),
    b?: (error: Error) => void,
    c?: () => void
  ): Subscription<T> {
    const { subscriber } = this.internal.get(symbol);

    return new Subscription(
      typeof a === 'function' ? { next: a, error: b, complete: c } : a,
      subscriber
    );
  }
}
