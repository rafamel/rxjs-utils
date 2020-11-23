import { Push } from '@definitions';
import { Observable, PushStream } from '../streams';

export function of<T>(...items: T[]): Push.Stream<T> {
  return Observable.of.call(PushStream, ...items) as any;
}
