import { Push } from '@definitions';
import { Observable } from '../classes/Observable';

export function from<T>(item: Push.Convertible<T>): Push.Observable<T> {
  return Observable.from(item);
}
