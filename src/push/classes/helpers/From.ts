import { Push } from '@definitions';
import { TypeGuard } from '@helpers';

export class From {
  public static compatible<T>(
    Constructor: Push.LikeConstructor,
    compatible: Push.Compatible<T>
  ): Push.Observable<T> {
    const observable = compatible[Symbol.observable]();

    if (!TypeGuard.isObject(observable) && !TypeGuard.isFunction(observable)) {
      throw new TypeError('Invalid Observable compatible object');
    }

    return this.like(Constructor, observable);
  }
  public static like<T>(
    Constructor: Push.LikeConstructor,
    like: Push.Like<T>
  ): Push.Observable<T> {
    return like.constructor === Constructor
      ? (like as any)
      : new Constructor((observer) => like.subscribe(observer as any));
  }
  public static iterable<T>(
    Constructor: Push.LikeConstructor,
    iterable: Iterable<T>
  ): Push.Like<T> {
    return new Constructor((obs) => {
      for (const item of iterable) {
        obs.next(item);
      }
      obs.complete();

      return () => undefined;
    });
  }
}
