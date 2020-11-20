import { NoParamFn, Push, WideRecord } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isSubscriptionLike } from '../utils/type-guards';
import { Subscription } from './Subscription';

export function teardownToFunction(teardown: Push.Cleanup): NoParamFn {
  if (TypeGuard.isFunction(teardown)) return teardown;
  if (TypeGuard.isEmpty(teardown)) return Handler.noop;
  if (isSubscriptionLike(teardown)) return () => teardown.unsubscribe();

  throw new TypeError(
    'Expected subscriber teardown to be a function or a subscription'
  );
}

export class From {
  public static like<T>(
    Observable: Push.ObservableConstructor,
    like: Push.Like<T>
  ): Push.Observable<T> {
    return like.constructor === Observable
      ? like
      : new Observable((observer) => like.subscribe(observer as any));
  }
  public static compatible<T>(
    Observable: Push.ObservableConstructor,
    compatible: Push.Compatible<T>
  ): Push.Observable<T> {
    const observable = compatible[Symbol.observable]();

    if (!TypeGuard.isObject(observable) && !TypeGuard.isFunction(observable)) {
      throw new TypeError('Invalid Observable compatible object');
    }

    return this.like(Observable, observable);
  }
  public static iterable<T>(
    Observable: Push.ObservableConstructor,
    iterable: Iterable<T>
  ): Push.Observable<T> {
    return new Observable<T>((observer) => {
      for (const item of iterable) {
        observer.next(item);
      }
      observer.complete();

      return () => undefined;
    });
  }
}

const $observer = Symbol('observer');
export class ManageObserver {
  public static set<T>(
    subscription: Subscription<T>,
    observer: Push.Observer<T>
  ): void {
    (subscription as any)[$observer] = observer;
  }
  public static get<T>(subscription: Subscription<T>): WideRecord {
    return (subscription as any)[$observer];
  }
  public static close<T>(subscription: Subscription<T>): void {
    (subscription as any)[$observer] = null;
  }
  public static isClosed<T>(subscription: Subscription<T>): boolean {
    return !(subscription as any)[$observer];
  }
}
