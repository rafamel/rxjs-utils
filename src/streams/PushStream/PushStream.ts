/* eslint-disable prefer-const */
import { NoParamFn, Observables, Push, UnaryFn } from '../../definitions';
import { TypeGuard } from '../../helpers';
import { Stream } from '../Stream';
import { fromIterable, fromObservableLike } from './from';
import { Subscription } from './Subscription';
import SymbolObservable from 'symbol-observable';

export class PushStream<T = any> extends Stream<T> implements Push.Stream<T> {
  static of<T>(...items: T[]): PushStream<T> {
    const Constructor = typeof this === 'function' ? this : PushStream;
    return fromIterable(Constructor, items) as any;
  }
  static from<T>(
    item:
      | Push.Subscriber<T>
      | Observables.Subscriber<T>
      | Push.Stream<T>
      | Observables.Observable<T>
      | Observables.Compatible<T>
      | Observables.Like<T>
      | Iterable<T>
  ): PushStream<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : PushStream;

    // Subscriber
    if (TypeGuard.isFunction(item)) return new Constructor(item);

    if (TypeGuard.isObject(item)) {
      const target: any = item;
      // Compatible
      const so = target[SymbolObservable];
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
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!TypeGuard.isFunction(subscriber)) {
      throw new TypeError('Expected subscriber to be a function');
    }

    super((exchange) => {
      let close: undefined | NoParamFn;

      const talkback = exchange({
        terminate(): void {
          if (close) close();
        }
      });
      if (talkback.closed) return;

      let err: undefined | [Error];
      let tear: undefined | NoParamFn;
      try {
        const teardown = subscriber(talkback);
        if (!TypeGuard.isEmpty(teardown)) {
          if (TypeGuard.isFunction(teardown)) {
            tear = teardown;
          } else if (
            TypeGuard.isObject(teardown) &&
            TypeGuard.isFunction(
              (teardown as Observables.Subscription).unsubscribe
            )
          ) {
            tear = () => teardown.unsubscribe();
          } else {
            throw new TypeError(
              'Expected subscriber teardown to be a function or a subscription'
            );
          }
        }
      } catch (e) {
        if (!err) err = [e];
      }

      close = tear;
      if (talkback.closed) {
        try {
          if (close) close();
        } catch (e) {
          if (!err) err = [e];
        }
      }

      // We can't assumed it's being subscribed to,
      // it could be consumed as any other stream,
      // meaning the talkback methods could error.
      if (err) {
        const error = err[0];
        err = undefined;
        try {
          talkback.error(error);
        } catch (e) {
          err = [e];
        }
        try {
          talkback.terminate();
        } catch (e) {
          if (!err) err = [e];
        }
        if (err) throw err;
      }
    });
  }
  public [SymbolObservable](): PushStream<T> {
    return this;
  }
  public [Symbol.observable](): PushStream<T> {
    return this;
  }
  public subscribe(observer?: Push.Observer<T>): Subscription<T>;
  public subscribe(observer?: Observables.Observer<T>): Subscription<T>;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Subscription<T>;
  public subscribe(observer: any, ...arr: any[]): Subscription<T> {
    if (TypeGuard.isFunction(observer)) {
      observer = {
        next: observer,
        error: arr[0],
        complete: arr[1],
        terminate: arr[2]
      };
    } else if (!TypeGuard.isObject(observer)) {
      observer = {};
    }

    return new Subscription(this, observer);
  }
}
