import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable } from '../classes';
import { isObservableCompatible, isObservableLike } from '../utils';
import { of } from './of';

export function from<T>(
  this: Push.LikeConstructor | void,
  item: Push.Convertible<T>
): Push.Observable<T> {
  const Constructor: Push.LikeConstructor = TypeGuard.isFunction(this)
    ? this
    : Observable;

  if (item instanceof Observable) {
    return item.constructor === Constructor
      ? (item as Push.Observable<T>)
      : fromLike(Constructor, item);
  } else if (item.constructor === Constructor) {
    return item as Push.Observable<T>;
  }

  if (isObservableCompatible(item)) {
    return fromCompatible(Constructor, item);
  }
  if (isObservableLike(item)) {
    return fromLike(Constructor, item);
  }
  if (TypeGuard.isIterable(item)) {
    return of.call(Constructor, ...item) as Push.Observable<T>;
  }

  throw new TypeError(`Unable to convert ${typeof item} into a Observable`);
}

function fromCompatible<T>(
  Constructor: Push.LikeConstructor,
  compatible: Push.Compatible<T>
): Push.Observable<T> {
  const observable = compatible[Symbol.observable]();

  if (!TypeGuard.isObject(observable) && !TypeGuard.isFunction(observable)) {
    throw new TypeError('Invalid Observable compatible object');
  }

  return fromLike(Constructor, observable);
}

function fromLike<T>(
  Constructor: Push.LikeConstructor,
  like: Push.Like<T>
): Push.Observable<T> {
  return like.constructor === Constructor
    ? (like as any)
    : new Constructor((observer) => like.subscribe(observer as any));
}
