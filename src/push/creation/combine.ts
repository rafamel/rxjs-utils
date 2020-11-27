import { Push, WideRecord } from '@definitions';
import { into } from 'pipettes';
import { map } from '../operators';
import { Observable } from '../classes';
import { intercept, isObservableConvertible } from '../utils';
import { from } from './from';
import { merge } from './merge';

export type CombineResponse<T extends WideRecord<Push.Convertible>> = {
  [P in keyof T]: T[P] extends Push.Convertible<infer U> ? U : never;
};

export function combine<T extends WideRecord<Push.Convertible>>(
  observables: T
): Push.Observable<CombineResponse<T>>;
export function combine<A>(a?: Push.Convertible<A>): Push.Observable<[A]>;
export function combine<A, B>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>
): Push.Observable<[A, B]>;
export function combine<A, B, C>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>
): Push.Observable<[A, B, C]>;
export function combine<A, B, C, D>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>
): Push.Observable<[A, B, C, D]>;
export function combine<A, B, C, D, E>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>
): Push.Observable<[A, B, C, D, E]>;
export function combine<A, B, C, D, E, F>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>,
  f: Push.Convertible<F>
): Push.Observable<[A, B, C, D, E, F]>;
export function combine<A, B, C, D, E, F, G>(
  a: Push.Convertible<A>,
  b: Push.Convertible<B>,
  c: Push.Convertible<C>,
  d: Push.Convertible<D>,
  e: Push.Convertible<E>,
  g: Push.Convertible<G>
): Push.Observable<[A, B, C, D, E, F, G]>;
export function combine<T>(
  ...arr: Array<Push.Convertible<T>>
): Push.Observable<T[]>;
export function combine(...arr: any): Push.Observable {
  if (isObservableConvertible(arr[0])) {
    return into(
      combineList(arr),
      map((current: any[]) => Array.from(current))
    );
  }

  const record: WideRecord<Push.Convertible> = arr[0];
  const dict: WideRecord<string> = {};
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

function combineList(arr: Push.Convertible[]): Push.Observable<any[]> {
  if (arr.length < 1) return new Observable(() => undefined);

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
