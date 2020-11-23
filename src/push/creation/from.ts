import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable, PushStream } from '../streams';
import { isObservableCompatible, isObservableLike } from '../utils';
import { of } from './of';

export function from<T>(
  this: Push.StreamConstructor | void,
  item:
    | Push.Observable<T>
    | Push.Compatible<T>
    | Push.Like<T>
    | Iterable<T>
    | PromiseLike<T>
): Push.Stream<T> {
  const from = Observable.from.bind(PushStream);

  if (isObservableCompatible(item)) {
    return from(item);
  }
  if (isObservableLike(item)) {
    return from({ [Symbol.observable]: () => item as any });
  }
  if (TypeGuard.isIterable(item)) {
    return of(...item);
  }
  if (TypeGuard.isPromiseLike(item)) {
    return new PushStream((obs) => {
      item.then(
        (value) => {
          obs.next(value);
          obs.complete();
        },
        (error) => {
          obs.error(error);
        }
      );
    });
  }
  throw new TypeError(`Unable to convert ${typeof item} into a PushStream`);
}
