import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Accessor, Handler, TypeGuard } from '@helpers';
import { Subscription } from './assistance';
import { Observable } from './Observable';
import { Parse } from './helpers';
import 'symbol-observable';

const $hooks = Symbol('hooks');
const $observable = Symbol('observable');

class PushStream<T = any> implements Push.Stream<T> {
  public static configure(hooks: Push.Hooks): void {
    const Constructor: any = TypeGuard.isFunction(this) ? this : PushStream;

    const inherits = Object.create(Constructor[$hooks]);
    Object.assign(inherits, hooks);

    Accessor.define(this, $hooks, inherits);
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
    const hooks: Push.Hooks = Constructor[$hooks];

    const errors: Error[] = [];
    const subscription = new Subscription(
      hearback,
      (obs) => {
        const fn = Parse.teardown(subscriber(obs));
        return () => {
          try {
            fn();
          } catch (err) {
            onError(err);
          } finally {
            try {
              const terminate = hearback.terminate;
              if (!TypeGuard.isEmpty(terminate)) terminate.call(hearback);
            } catch (err) {
              onError(err);
            }
          }
        };
      },
      hooks
    );

    function onError(err: Error): void {
      if (!hooks) return;
      if (typeof subscription !== 'undefined') {
        if (hooks.onUnhandledError) hooks.onUnhandledError(err, subscription);
      } else {
        errors.push(err);
      }
    }

    for (const error of errors) {
      if (hooks.onUnhandledError) hooks.onUnhandledError(error, subscription);
    }

    return subscription;
  }
}

Accessor.define(PushStream, $hooks, {
  onUnhandledError(error: Error, subscription: Push.Subscription) {
    subscription.unsubscribe();
    setTimeout(() => Handler.throws(error), 0);
  }
});

export { PushStream };
