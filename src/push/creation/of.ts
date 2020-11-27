import { Push } from '@definitions';
import { Observable } from '../classes/Observable';

export function of<T>(...items: T[]): Push.Observable<T> {
  return Observable.of(...items);
}
