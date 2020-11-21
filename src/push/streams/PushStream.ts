import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, PropertyManager, TypeGuard } from '@helpers';
import { Subscription } from './assistance';
import { Observable } from './Observable';
import { Parse } from './helpers';
import 'symbol-observable';

const $subscriber = Symbol('subscriber');
const $observable = Symbol('observable');

const $hooks = new PropertyManager<Push.Hooks>('hooks');

export class PushStream<T = any> implements Push.Stream<T> {
  public static configure(hooks: Push.Hooks): void {
    $hooks.set(this, Object.assign({}, $hooks.get(this), hooks));
  }
  private [$subscriber]: Push.Subscriber<T>;
  private [$observable]: void | Observable<T>;
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected producer to be a function');
    }

    this[$subscriber] = subscriber;
  }
  public [Symbol.observable](): Observable<T> {
    let observable = this[$observable];
    if (observable) return observable;

    const subscriber = this[$subscriber];
    observable = new Observable((obs) => subscriber(obs));
    return (this[$observable] = observable);
  }
  public subscribe(hearback?: Empty | Push.Hearback<T>): Push.Subscription;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Push.Subscription;
  public subscribe(hearback: any, ...arr: any[]): Push.Subscription {
    let subscriber = this[$subscriber];

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

    const hooks = $hooks.fallback(this.constructor, {
      onUnhandledError(error, subscription) {
        subscription.unsubscribe();
        setTimeout(() => Handler.throws(error), 0);
      }
    });

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
