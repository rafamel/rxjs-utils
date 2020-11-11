import { NoParamFn, Observables, UnaryFn } from '../../../src/definitions';
import { TypeGuard } from '../../../src/helpers';
import {
  fromIterable,
  fromObservableLike
} from '../../../src/streams/PushStream/from';
import { Subscription } from './Subscription';
import 'symbol-observable';

const $subscriber = Symbol('subscriber');

export class Observable<T = any> implements Observables.Observable<T> {
  static of<T>(...items: T[]): Observable<T> {
    const Constructor = typeof this === 'function' ? this : Observable;
    return fromIterable(Constructor, items) as any;
  }
  static from<T>(
    item:
      | Observables.Subscriber<T>
      | Observables.Observable<T>
      | Observables.Compatible<T>
      | Observables.Like<T>
      | Iterable<T>
  ): Observable<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : Observable;

    // Subscriber
    if (TypeGuard.isFunction(item)) return new Constructor(item);

    if (TypeGuard.isObject(item)) {
      const target: any = item;
      // Compatible
      const so = target[Symbol.observable];
      if (TypeGuard.isFunction(so)) {
        const obs = so();
        if (!TypeGuard.isObject(obs) && !TypeGuard.isFunction(obs)) {
          throw new TypeError('Invalid Observable compatible object');
        }
        return fromObservableLike(Constructor, obs) as any;
      }

      // Like
      if (TypeGuard.isFunction(target.subscribe)) {
        return fromObservableLike(Constructor, target) as any;
      }

      // Iterable
      if (TypeGuard.isFunction(target[Symbol.iterator])) {
        return fromIterable(Constructor, target) as any;
      }
    }

    throw new TypeError(`Unable to convert ${typeof item} into an Observable`);
  }
  private [$subscriber]: Observables.Subscriber<T>;
  public constructor(subscriber: Observables.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    this[$subscriber] = subscriber;
  }
  public [Symbol.observable](): Observable<T> {
    return this;
  }
  public subscribe(observer: Observables.Observer<T>): Subscription<T>;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn
  ): Subscription<T>;
  public subscribe(observer: any, ...arr: any[]): Subscription<T> {
    if (TypeGuard.isFunction(observer)) {
      observer = { next: observer, error: arr[0], complete: arr[1] };
    } else if (!TypeGuard.isObject(observer)) {
      observer = {};
    }

    return new Subscription(observer, this[$subscriber]);
  }
}
