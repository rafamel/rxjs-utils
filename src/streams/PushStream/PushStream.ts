/* eslint-disable prefer-const */
import { NoParamFn, Observables, Push, UnaryFn } from '../../definitions';
import { Handler, IdentityGuard } from '../../helpers';
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
    const Constructor = IdentityGuard.isFunction(this) ? this : PushStream;

    // Subscriber
    if (IdentityGuard.isFunction(item)) return new Constructor(item);

    if (IdentityGuard.isObject(item)) {
      const target: any = item;
      // Compatible
      const so = target[SymbolObservable];
      if (IdentityGuard.isFunction(so)) {
        const obs = so();
        if (!IdentityGuard.isObject(obs) && !IdentityGuard.isFunction(obs)) {
          throw new TypeError('Invalid Observable compatible object');
        }
        return fromObservableLike(Constructor, obs) as any;
      }

      // Like
      if (IdentityGuard.isFunction(target.subscribe)) {
        return fromObservableLike(Constructor, target) as any;
      }

      // Iterable
      if (IdentityGuard.isFunction(target[Symbol.iterator])) {
        return fromIterable(Constructor, target) as any;
      }
    }

    throw new TypeError(`Unable to convert ${typeof item} into an Observable`);
  }
  public constructor(subscriber: Push.Subscriber<T>) {
    if (!IdentityGuard.isFunction(subscriber)) {
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
        if (!IdentityGuard.isEmpty(teardown)) {
          if (IdentityGuard.isFunction(teardown)) {
            tear = teardown;
          } else if (
            IdentityGuard.isObject(teardown) &&
            IdentityGuard.isFunction(
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

      if (err) {
        const error = err[0];
        Handler.catches(() => talkback.error(error));
        talkback.terminate();
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
    if (IdentityGuard.isFunction(observer)) {
      observer = {
        next: observer,
        error: arr[0],
        complete: arr[1],
        terminate: arr[2]
      };
    } else if (!IdentityGuard.isObject(observer)) {
      observer = {};
    }

    return new Subscription(this, observer);
  }
}
