import { Push } from '@definitions';
import { Accessor, Handler } from '@helpers';
import { isObservableCompatible, isObservableLike } from '../utils/type-guards';
import { Hooks, Subscription } from './assistance';
import { From } from './helpers';
import { Empty, NullaryFn, UnaryFn, TypeGuard } from 'type-core';
import 'symbol-observable';

const $hooks = Symbol('hooks');

const defaultHooks: Push.Hooks = {
  onUnhandledError(error: Error, subscription: Push.Subscription) {
    subscription.unsubscribe();
    setTimeout(() => Handler.throws(error), 0);
  }
};

export class Observable<T = any> {
  public static configure(hooks?: Push.Hooks): void {
    const Constructor: any = TypeGuard.isFunction(this) ? this : Observable;
    const defaults = Object.getPrototypeOf(Constructor)[$hooks] || defaultHooks;

    const instance = Object.create(defaults || {});
    Object.assign(instance, hooks);
    Accessor.define(this, $hooks, instance);
  }
  public static of<T>(...items: T[]): Observable<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : Observable;
    return From.iterable(Constructor, items) as Observable<T>;
  }
  public static from<T>(item: Push.Convertible<T>): Observable<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : Observable;

    if (item instanceof Observable) {
      return item.constructor === Constructor
        ? item
        : (From.like(Constructor, item) as Observable<T>);
    } else if (item.constructor === Constructor) {
      return item;
    }

    if (isObservableCompatible(item)) {
      return From.compatible(Constructor, item) as Observable<T>;
    }
    if (isObservableLike(item)) {
      return From.like(Constructor, item) as Observable<T>;
    }
    if (TypeGuard.isIterable(item)) {
      return From.iterable(Constructor, item) as Observable<T>;
    }

    throw new TypeError(`Unable to convert ${typeof item} into a Observable`);
  }
  #subscriber: Push.Subscriber<T>;
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    this.#subscriber = subscriber;
  }
  public [Symbol.observable](): Observable<T> {
    return this;
  }
  public subscribe(observer?: Empty | Push.Observer<T>): Push.Subscription;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NullaryFn
  ): Push.Subscription;
  public subscribe(observer: any, ...arr: any[]): Push.Subscription {
    let subscriber = this.#subscriber;

    if (TypeGuard.isFunction(observer)) {
      observer = { next: observer, error: arr[0], complete: arr[1] };
    } else if (!TypeGuard.isObject(observer)) {
      if (!TypeGuard.isEmpty(observer)) {
        subscriber = () => {
          throw new TypeError(
            `Expected observer to be an object or a function`
          );
        };
      }
      observer = {};
    }

    const Constructor: any = this.constructor;
    const hooks = new Hooks(Constructor[$hooks] || defaultHooks);
    return new Subscription(observer, subscriber, {
      onUnhandledError: hooks.onUnhandledError.bind(hooks),
      onStoppedNotification: hooks.onStoppedNotification.bind(hooks)
    });
  }
}
