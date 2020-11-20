import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { isObservableCompatible } from '../utils/type-guards';
import { Subscription } from './Subscription';
import { From } from './helpers';
import 'symbol-observable';

const $subscriber = Symbol('subscriber');

export class Observable<T = any> {
  public static of<T>(...items: T[]): Observable<T> {
    const Constructor = typeof this === 'function' ? this : Observable;
    return From.iterable(Constructor, items) as Observable<T>;
  }
  public static from<T>(
    item: Push.Observable<T> | Push.Compatible<T> | Iterable<T>
  ): Observable<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : Observable;

    if (isObservableCompatible(item)) {
      return From.compatible(Constructor, item) as Observable<T>;
    }
    if (TypeGuard.isIterable(item)) {
      return From.iterable(Constructor, item) as Observable<T>;
    }
    throw new TypeError(`Unable to convert ${typeof item} into an Observable`);
  }
  private [$subscriber]: Push.Subscriber<T>;
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    this[$subscriber] = subscriber;
  }
  public [Symbol.observable](): Observable<T> {
    return this;
  }
  public subscribe(observer?: Empty | Push.Observer<T>): Push.Subscription;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn
  ): Push.Subscription;
  public subscribe(observer: any, ...arr: any[]): Push.Subscription {
    if (TypeGuard.isFunction(observer)) {
      observer = { next: observer, error: arr[0], complete: arr[1] };
    } else if (!TypeGuard.isObject(observer)) {
      observer = {};
    }

    return new Subscription(observer, this[$subscriber]);
  }
}
