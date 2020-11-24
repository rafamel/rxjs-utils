import { Push } from '@definitions';
import { into } from 'pipettes';
import { operate } from '../utils';

export function switchMap<T, U>(
  projection: (value: T, index: number) => Push.Like<U> | Push.Compatible<U>
): Push.Operation<T, U> {
  return operate<T, U>((tb) => {
    let index = 0;
    let subscription: Push.Subscription | null = null;
    let parentComplete = false;

    return {
      next(value: T): void {
        const stream = into(
          projection(value, index++),
          operate<U>((inner) => ({
            start(subs) {
              subscription = subs;
            },
            complete() {
              if (parentComplete) inner.complete();
            }
          }))
        );

        if (subscription) subscription.unsubscribe();
        if (!tb.closed) stream.subscribe(tb);
      },
      complete() {
        parentComplete = true;
        if (subscription && subscription.closed) tb.complete();
      },
      terminate() {
        if (tb.closed || !parentComplete) {
          if (!subscription || subscription.closed) return;
          subscription.unsubscribe();
        }
      }
    };
  });
}
