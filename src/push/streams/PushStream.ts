import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { ObservableFrom } from './helpers';
import { Subscription } from './Subscription';
import 'symbol-observable';

const $subscriber = Symbol('subscriber');

export class PushStream<T = any> implements Push.PushStream<T> {
  public static raise: boolean = false;
  public static of<T>(...items: T[]): PushStream<T> {
    const Constructor = typeof this === 'function' ? this : PushStream;
    return ObservableFrom.iterable(Constructor, items) as any;
  }
  public static from<T>(
    item: Push.Observable<T> | Push.Compatible<T> | Push.Like<T> | Iterable<T>
  ): PushStream<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : PushStream;

    if (TypeGuard.isObject(item)) {
      const target: any = item;
      // Compatible
      const so = target[Symbol.observable];
      if (TypeGuard.isFunction(so)) {
        const obs = so();
        if (!TypeGuard.isObject(obs) && !TypeGuard.isFunction(obs)) {
          throw new TypeError('Invalid Observable compatible object');
        }
        return ObservableFrom.like(Constructor, obs) as any;
      }

      // Like
      if (TypeGuard.isFunction(target.subscribe)) {
        return ObservableFrom.like(Constructor, target) as any;
      }

      // Iterable
      if (TypeGuard.isFunction(target[Symbol.iterator])) {
        return ObservableFrom.iterable(Constructor, target) as any;
      }
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
  public [Symbol.observable](): PushStream<T> {
    return this;
  }
  public subscribe(observer?: Empty | Push.Observer<T>): Subscription<T>;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn
  ): Subscription<T>;
  public subscribe(observer: any, ...arr: any[]): Subscription<T> {
    const constructor = this.constructor as typeof PushStream;

    if (TypeGuard.isFunction(observer)) {
      observer = {
        next: observer,
        error: arr[0],
        complete: arr[1]
      };
    } else if (!TypeGuard.isObject(observer)) {
      if (constructor.raise && !TypeGuard.isEmpty(observer)) {
        throw TypeError(`Expected observer to be an object or a function`);
      }

      observer = {};
    }

    return new Subscription(
      observer,
      this[$subscriber],
      constructor.raise ? Handler.throws : null
    );
  }
}
