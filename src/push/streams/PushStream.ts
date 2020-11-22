import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Accessor, Handler, TypeGuard } from '@helpers';
import { Hooks, Subscription } from './assistance';
import { Observable } from './Observable';
import { Invoke } from './helpers';
import 'symbol-observable';

const $hooks = Symbol('hooks');
const $observable = Symbol('observable');

const defaultHooks: Push.Hooks = {
  onUnhandledError(error: Error, subscription: Push.Subscription) {
    subscription.unsubscribe();
    setTimeout(() => Handler.throws(error), 0);
  }
};

export class PushStream<T = any> implements Push.Stream<T> {
  public static configure(hooks?: Push.Hooks): void {
    const Constructor: any = TypeGuard.isFunction(this) ? this : PushStream;
    const defaults = Object.getPrototypeOf(Constructor)[$hooks] || defaultHooks;

    const instance = Object.create(defaults || {});
    Object.assign(instance, hooks);
    Accessor.define(this, $hooks, instance);
  }
  #subscriber: Push.Subscriber<T>;
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected producer to be a function');
    }

    this.#subscriber = subscriber;
  }
  public [Symbol.observable](): Observable<T> {
    return Accessor.fallback(
      this,
      $observable,
      () => new Observable((obs) => this.#subscriber(obs))
    );
  }
  public subscribe(hearback?: Empty | Push.Hearback<T>): Push.Subscription;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Push.Subscription;
  public subscribe(hearback: any, ...arr: any[]): Push.Subscription {
    let subscriber = this.#subscriber;

    if (TypeGuard.isFunction(hearback)) {
      hearback = {
        next: hearback,
        error: arr[0],
        complete: arr[1],
        terminate: arr[2]
      };
    } else if (!TypeGuard.isObject(hearback)) {
      if (!TypeGuard.isEmpty(hearback)) {
        subscriber = () => {
          throw new TypeError(
            `Expected hearback to be an object or a function`
          );
        };
      }
      hearback = {};
    }

    const Constructor: any = this.constructor;
    const hooks = new Hooks(Constructor[$hooks] || defaultHooks);
    return new Subscription(hearback, subscriber, {
      onUnhandledError: hooks.onUnhandledError.bind(hooks),
      onStoppedNotification: hooks.onStoppedNotification.bind(hooks),
      onCloseSubscription(subscription) {
        try {
          Invoke.method(hearback, 'terminate');
        } catch (err) {
          hooks.onUnhandledError(err, subscription);
        }
        hooks.onCloseSubscription(subscription);
      }
    });
  }
}
