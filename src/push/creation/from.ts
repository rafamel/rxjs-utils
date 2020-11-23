import { Push } from '@definitions';
import { Observable, PushStream } from '../streams';
import { isObservableLike } from '../utils';

export function from<T>(
  this: Push.StreamConstructor | void,
  item: Push.Observable<T> | Push.Compatible<T> | Push.Like<T> | Iterable<T>
): Push.Stream<T> {
  const from = Observable.from.bind(PushStream);

  return isObservableLike(item)
    ? from({ [Symbol.observable]: () => item as any })
    : from(item);
}
