import SymbolObservable from 'symbol-observable';
import { SafeInternal } from '../helpers/safe-internal';
import { Subscription } from './Subscription';
import { Observables as Types } from '@definitions';

type SafeProperties<T> = SafeInternal<{
  subscriber: Types.Subscriber<T>;
}>;

const map = new WeakMap();

export class Observable<T = any> implements Types.Observable<T> {
  public static of<T>(...items: T[]): Observable<T> {
    return Observable.from(items);
  }
  public static from<T>(
    item: Types.Observable<T> | Types.Compatible<T> | Iterable<T>
  ): Observable<T> {
    const value: any = item;

    if (value instanceof Observable) {
      return value;
    }

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
  private safe: SafeProperties<T>;
  public constructor(subscriber: Types.Subscriber<T>) {
    this.safe = new SafeInternal(this, map, { subscriber });
  }
  public ['@@observable'](): Observable<T> {
    return this;
  }
  public [SymbolObservable](): Observable<T> {
    return this;
  }
  public subscribe(observer: Types.Observer<T>): Subscription<T>;
  public subscribe(
    onNext: (value: T) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Subscription<T>;
  public subscribe(
    a: Types.Observer<T> | ((value: T) => void),
    b?: (error: Error) => void,
    c?: () => void
  ): Subscription<T> {
    const { subscriber } = this.safe.get(map);

    return new Subscription(
      typeof a === 'function' ? { next: a, error: b, complete: c } : a,
      subscriber
    );
  }
}
