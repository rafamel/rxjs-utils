import { Push } from '@definitions';
import { intercept, operate } from '../utils';

export function switchMap<T, U>(
  projection: (value: T, index: number) => Push.Like<U> | Push.Compatible<U>
): Push.Operation<T, U> {
  return operate<T, U>((obs) => {
    let index = 0;
    let subscription: Push.Subscription | null = null;
    let parentComplete = false;

    return {
      next(value: T): void {
        if (subscription) subscription.unsubscribe();
        if (obs.closed) return;

        intercept(projection(value, index++), obs, {
          start(subs) {
            subscription = subs;
          },
          complete() {
            if (parentComplete) obs.complete();
          }
        });
      },
      complete() {
        parentComplete = true;
        if (subscription && subscription.closed) obs.complete();
      },
      terminate() {
        if (obs.closed || !parentComplete) {
          if (!subscription || subscription.closed) return;
          subscription.unsubscribe();
        }
      }
    };
  });
}
