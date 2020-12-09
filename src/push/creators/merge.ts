import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { intercept } from '../utils/intercept';
import { from } from './from';

export function merge<A>(a: Push.Convertible<A>): Push.Observable<A>;
export function merge<A, B>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>
): Push.Observable<A | B>;
export function merge<A, B, C>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>
): Push.Observable<A | B | C>;
export function merge<A, B, C, D>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>
): Push.Observable<A | B | C | D>;
export function merge<A, B, C, D, E>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>
): Push.Observable<A | B | C | D | E>;
export function merge<A, B, C, D, E, F>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>,
  f: Push.Convertible<F>
): Push.Observable<A | B | C | D | E | F>;
export function merge<A, B, C, D, E, F, G>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>,
  f: Push.Convertible<F>,
  g: Push.Convertible<G>
): Push.Observable<A | B | C | D | E | F | G>;
export function merge<T>(
  ...arr: Array<Push.Convertible<T>>
): Push.Observable<T>;
export function merge(...arr: any): Push.Observable {
  if (arr.length < 1) {
    throw Error(`Must provide at least one observable to merge`);
  }

  const observables: Push.Observable[] = arr.map(from);
  if (observables.length === 1) return observables[0];

  return new Observable((obs) => {
    let completed = 0;

    const subscriptions = observables
      .map((observable) => {
        return obs.closed
          ? null
          : intercept(observable, obs, {
              complete() {
                completed++;
                if (completed >= observables.length) obs.complete();
              }
            });
      })
      .filter((item): item is Push.Subscription => Boolean(item));

    return () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    };
  });
}
