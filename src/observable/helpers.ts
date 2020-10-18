import { Observables } from '@definitions';

export function fromObservableLike<T>(
  Observable: Observables.Constructor,
  observable: Observables.Observable<T> | Observables.Like<T>
): Observables.Observable<T> {
  return observable.constructor === Observable
    ? observable
    : new Observable((observer) => observable.subscribe(observer as any));
}

export function fromIterable<T>(
  Observable: Observables.Constructor,
  iterable: Iterable<T>
): Observables.Observable<T> {
  return new Observable<T>((observer) => {
    for (const item of iterable) {
      observer.next(item);
    }
    observer.complete();

    return () => undefined;
  });
}
