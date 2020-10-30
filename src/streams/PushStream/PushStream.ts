import { NoParamFn, Observables, Push, UnaryFn } from '../../definitions';
import { isEmpty, isFunction, isObject } from '../../helpers';
import { Stream } from '../Stream';
import { fromIterable, fromObservableLike } from './from';
import { Subscription } from './Subscription';
import SymbolObservable from 'symbol-observable';

export class PushStream<T = any, R = void> extends Stream<T, R>
  implements Push.Stream<T, R> {
  static of<T>(...items: T[]): PushStream<T> {
    const Constructor = typeof this === 'function' ? this : PushStream;
    return fromIterable(Constructor, items) as any;
  }
  static from<T, R = void>(
    item:
      | Push.Subscriber<T, R>
      | Observables.Subscriber<T, R>
      | Push.Stream<T, R>
      | Observables.Observable<T, R>
      | Observables.Compatible<T, R>
      | Observables.Like<T>
      | Iterable<T>
  ): PushStream<T, R> {
    const Constructor = isFunction(this) ? this : PushStream;

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
  public constructor(subscriber: Push.Subscriber<T, R>) {
    if (!isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    super((exchange) => {
      let terminated = false;
      let close: undefined | NoParamFn;
      let terminateError: undefined | [Error];

      const talkback = exchange({
        terminate(): void {
          if (terminated) return;

          terminated = true;
          let err: void | [Error];

          try {
            if (talkback) talkback.terminate();
          } catch (e) {
            err = [e];
          }

          if (close) {
            try {
              close();
            } catch (e) {
              if (!err) err = [e];
            }
            if (err) throw err[0];
          } else if (err && !terminateError) {
            terminateError = err;
          }
        }
      });
      if (talkback.closed) return;

      let tear: undefined | NoParamFn;
      try {
        const teardown = subscriber(talkback);

        if (!isEmpty(teardown)) {
          if (isFunction(teardown)) {
            tear = teardown;
          } else if (
            isObject(teardown) &&
            isFunction((teardown as Observables.Subscription).unsubscribe)
          ) {
            tear = () => teardown.unsubscribe();
          } else {
            throw new TypeError(
              'Expected subscriber teardown to be a function or a subscription'
            );
          }
        }
      } catch (err) {
        talkback.error(err);
      }

      if (talkback.closed) {
        try {
          if (tear) tear();
        } catch (err) {
          if (!terminateError) terminateError = [err];
        }
        if (terminateError) throw terminateError[0];
      } else {
        close = tear;
      }
    });
  }
  public [SymbolObservable](): PushStream<T, R> {
    return this;
  }
  public [Symbol.observable](): PushStream<T, R> {
    return this;
  }
  public subscribe(observer: Push.Observer<T, R>): Subscription<T, R>;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<R>,
    onTerminate?: NoParamFn
  ): Subscription<T, R>;
  public subscribe(observer: any, ...arr: any[]): Subscription<T, R> {
    if (isFunction(observer)) {
      observer = {
        next: observer,
        error: arr[0],
        complete: arr[1],
        terminate: arr[2]
      };
    } else if (!isObject(observer)) {
      throw new TypeError('Expected observer to be an object or function');
    }

    return new Subscription(this, observer);
  }
}
