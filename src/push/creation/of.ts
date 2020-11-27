import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable } from '../classes';

export function of<T>(
  this: Push.LikeConstructor | void,
  ...items: T[]
): Push.Observable<T> {
  const Constructor: Push.LikeConstructor = TypeGuard.isFunction(this)
    ? this
    : Observable;

  const obs$ = new Constructor((obs) => {
    for (const item of items) {
      obs.next(item);
    }
    obs.complete();

    return () => undefined;
  });

  return obs$ as Push.Observable<T>;
}
