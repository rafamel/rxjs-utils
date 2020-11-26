import { Push } from '@definitions';
import { PushStream } from '../streams';
import { intercept } from '../utils';
import { from } from './from';

export function merge<A, B = A, C = A, D = A, E = A, F = A, G = A, T = A>(
  a: Push.Source<A>,
  b?: Push.Source<B>,
  c?: Push.Source<C>,
  d?: Push.Source<D>,
  e?: Push.Source<E>,
  f?: Push.Source<F>,
  g?: Push.Source<G>,
  ...arr: Array<Push.Source<T>>
): Push.Stream<A | B | C | D | E | F | G | T>;
export function merge<T>(...arr: Array<Push.Source<T>>): Push.Stream<T>;
export function merge(...arr: any): Push.Stream {
  if (arr.length < 1) throw Error(`Must provide at least one stream to merge`);

  const streams: Push.Stream[] = arr.map(from);
  if (streams.length === 1) return streams[0];

  return new PushStream((obs) => {
    let terminated = 0;

    const subscriptions = streams
      .map((stream) => {
        return obs.closed
          ? null
          : intercept(stream, obs, {
              complete() {
                if (terminated + 1 >= streams.length) obs.complete();
              },
              terminate() {
                terminated++;
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
