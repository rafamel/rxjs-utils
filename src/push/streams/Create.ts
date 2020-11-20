import { Push } from '@definitions';
import { isObservableCompatible, isObservableLike } from '../utils';
import { Observable } from './Observable';
import { PushStream } from './PushStream';

export class Create {
  public static of<T>(...items: T[]): PushStream<T> {
    return Observable.of.call(PushStream, ...items) as any;
  }
  public static from<T>(
    item: Push.Observable<T> | Push.Compatible<T> | Push.Like<T> | Iterable<T>
  ): PushStream<T> {
    const from = Observable.from.bind(PushStream);

    if (isObservableCompatible(item)) return from(item) as any;
    if (isObservableLike(item)) {
      const compatible: any = { [Symbol.observable]: () => item };
      return from(compatible) as any;
    }
    return from(item) as any;
  }
}
