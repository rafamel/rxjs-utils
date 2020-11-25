import { Push } from '@definitions';
import { PushStream } from '../streams';
import { intercept } from '../utils';
import { from } from './from';

export function merge<A, B = A, C = A, D = A, E = A, F = A, G = A, T = A>(
  a: Push.Compatible<A> | Push.Like<A>,
  b?: Push.Compatible<B> | Push.Like<B>,
  c?: Push.Compatible<C> | Push.Like<C>,
  d?: Push.Compatible<D> | Push.Like<D>,
  e?: Push.Compatible<E> | Push.Like<E>,
  f?: Push.Compatible<F> | Push.Like<F>,
  g?: Push.Compatible<G> | Push.Like<G>,
  ...arr: Array<Push.Compatible<T> | Push.Like<T>>
): Push.Stream<A | B | C | D | E | F | G | T>;
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
