import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { map } from '../operators/map';
import { intercept } from '../utils/intercept';
import { from } from './from';
import { merge } from './merge';
import { Members } from 'type-core';
import { into } from 'pipettes';

export type CombineResponse<T extends Members<Push.Convertible>> = {
  [P in keyof T]: T[P] extends Push.Convertible<infer U> ? U : never;
};

export function combine<T extends Members<Push.Convertible>>(
  observables: T
): Push.Observable<CombineResponse<T>>;
export function combine<A>(
  observables: [Push.Convertible<A>]
): Push.Observable<[A]>;
export function combine<A, B>(
  observables: [Push.Convertible<A>, Push.Convertible<B>]
): Push.Observable<[A, B]>;
export function combine<A, B, C>(
  observables: [Push.Convertible<A>, Push.Convertible<B>, Push.Convertible<C>]
): Push.Observable<[A, B, C]>;
export function combine<A, B, C, D>(
  observables: [
    Push.Convertible<A>,
    Push.Convertible<B>,
    Push.Convertible<C>,
    Push.Convertible<D>
  ]
): Push.Observable<[A, B, C, D]>;
export function combine<A, B, C, D, E>(
  observables: [
    Push.Convertible<A>,
    Push.Convertible<B>,
    Push.Convertible<C>,
    Push.Convertible<D>,
    Push.Convertible<E>
  ]
): Push.Observable<[A, B, C, D, E]>;
export function combine<A, B, C, D, E, F>(
  observables: [
    Push.Convertible<A>,
    Push.Convertible<B>,
    Push.Convertible<C>,
    Push.Convertible<D>,
    Push.Convertible<E>,
    Push.Convertible<F>
  ]
): Push.Observable<[A, B, C, D, E, F]>;
export function combine<A, B, C, D, E, F, G>(
  observables: [
    Push.Convertible<A>,
    Push.Convertible<B>,
    Push.Convertible<C>,
    Push.Convertible<D>,
    Push.Convertible<E>,
    Push.Convertible<F>,
    Push.Convertible<G>
  ]
): Push.Observable<[A, B, C, D, E, F, G]>;
export function combine<T>(
  observables: Array<Push.Convertible<T>>
): Push.Observable<T[]>;
export function combine(observables: any): Push.Observable {
  if (!observables) return combineList();

  if (Array.isArray(observables)) {
    return into(
      combineList(observables),
      map((current: any[]) => Array.from(current))
    );
  }

  const record: Members<Push.Convertible> = observables;
  const dict: Members<string> = {};
  const list: Push.Convertible[] = [];
  for (const [key, obs] of Object.entries(record)) {
    dict[list.length] = key;
    list.push(obs);
  }
  return into(
    combineList(list),
    map((current: any[]) => {
      return current.reduce((acc, value, i) => {
        acc[dict[i]] = value;
        return acc;
      }, {});
    })
  );
}

function combineList(arr?: Push.Convertible[]): Push.Observable<any[]> {
  if (!arr || arr.length < 1) {
    throw Error(`Must provide at least one observable to combine`);
  }

  const observables: Push.Observable[] = arr.map(from);
  if (observables.length === 1) {
    return into(
      observables[0],
      map((value) => [value])
    );
  }

  const sources = observables.map(
    (obs, i): Push.Observable<[number, any]> => {
      return into(
        from(obs),
        map((value) => [i, value])
      );
    }
  );

  return new Observable((obs) => {
    const pending = new Set<number>(
      Array(observables.length)
        .fill(0)
        .map((_, i) => i)
    );
    const current = Array(observables.length).fill(0);
    return intercept(merge(...sources), obs, {
      next([index, value]) {
        current[index] = value;

        if (pending.has(index)) pending.delete(index);
        if (!pending.size) obs.next(current);
      }
    });
  });
}
