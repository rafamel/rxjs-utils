import { Push } from '@definitions';
import { Observable } from '../classes/Observable';

export function fromPromise<T>(promise: PromiseLike<T>): Push.Observable<T> {
  return new Observable((obs) => {
    promise.then(
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
