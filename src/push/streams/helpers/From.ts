import { Push } from '@definitions';
import { TypeGuard } from '@helpers';

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
