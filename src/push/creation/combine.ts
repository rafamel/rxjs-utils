import { Push, WideRecord } from '@definitions';
import { into } from 'pipettes';
import { map } from '../operators';
import { PushStream } from '../streams';
import { intercept, isSource } from '../utils';
import { from } from './from';
import { merge } from './merge';

export type CombineResponse<T extends WideRecord<Push.Source>> = {
  [P in keyof T]: T[P] extends Push.Source<infer U> ? U : never;
};

export function combine<T extends WideRecord<Push.Source>>(
  observables: T
): Push.Stream<CombineResponse<T>>;
export function combine<A>(a?: Push.Source<A>): Push.Stream<[A]>;
export function combine<A, B>(
  a: Push.Source<A>,
  b: Push.Source<B>
): Push.Stream<[A, B]>;
export function combine<A, B, C>(
  a: Push.Source<A>,
  b: Push.Source<B>,
  c: Push.Source<C>
): Push.Stream<[A, B, C]>;
export function combine<A, B, C, D>(
  a: Push.Source<A>,
  b: Push.Source<B>,
  c: Push.Source<C>,
  d: Push.Source<D>
): Push.Stream<[A, B, C, D]>;
export function combine<A, B, C, D, E>(
  a: Push.Source<A>,
  b: Push.Source<B>,
  c: Push.Source<C>,
  d: Push.Source<D>,
  e: Push.Source<E>
): Push.Stream<[A, B, C, D, E]>;
export function combine<A, B, C, D, E, F>(
  a: Push.Source<A>,
  b: Push.Source<B>,
  c: Push.Source<C>,
  d: Push.Source<D>,
  e: Push.Source<E>,
  f: Push.Source<F>
): Push.Stream<[A, B, C, D, E, F]>;
export function combine<A, B, C, D, E, F, G>(
  a: Push.Source<A>,
  b: Push.Source<B>,
  c: Push.Source<C>,
  d: Push.Source<D>,
  e: Push.Source<E>,
  g: Push.Source<G>
): Push.Stream<[A, B, C, D, E, F, G]>;
export function combine<T>(...arr: Array<Push.Source<T>>): Push.Stream<T[]>;
export function combine(...arr: any): Push.Stream {
  if (isSource(arr[0])) {
    return into(
      combineList(arr),
      map((current: any[]) => Array.from(current))
    );
  }

  const record: WideRecord<Push.Source> = arr[0];
  const dict: WideRecord<string> = {};
  const list: Push.Source[] = [];
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

function combineList(arr: Push.Source[]): Push.Stream<any[]> {
  if (arr.length < 1) return new PushStream(() => undefined);

  const streams: Push.Stream[] = arr.map(from);
  if (streams.length === 1) {
    return into(
      streams[0],
      map((value) => [value])
    );
  }

  const sources = streams.map(
    (obs, i): Push.Stream<[number, any]> => {
      return into(
        from<any>(obs),
        map((value) => [i, value])
      );
    }
  );

  return new PushStream((obs) => {
    const pending = new Set<number>(
      Array(streams.length)
        .fill(0)
        .map((_, i) => i)
    );
    const current = Array(streams.length).fill(0);
    return intercept(merge(...sources), obs, {
      next([index, value]) {
        current[index] = value;

        if (pending.has(index)) pending.delete(index);
        if (!pending.size) obs.next(current);
      }
    });
  });
}
