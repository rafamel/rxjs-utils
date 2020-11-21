import { Push } from '@definitions';
import { isObservableCompatible, isObservableLike } from '../utils/type-guards';
import { Observable, PushStream } from '../streams';

export function of<T>(...items: T[]): Push.Stream<T> {
  return Observable.of.call(PushStream, ...items) as any;
}

export function from<T>(
  item: Push.Observable<T> | Push.Compatible<T> | Push.Like<T> | Iterable<T>
): Push.Stream<T> {
  const from = Observable.from.bind(PushStream);

  if (isObservableCompatible(item)) return from(item) as any;
  if (isObservableLike(item)) {
    const compatible: any = { [Symbol.observable]: () => item };
    return from(compatible) as any;
  }
  return from(item) as any;
}
