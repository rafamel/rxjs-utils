import { Push } from '@definitions';
import { operate } from '../../utils/operate';
import { intercept } from '../../utils/intercept';

export function switchMap<T, U>(
  projection: (value: T, index: number) => Push.Convertible<U>
): Push.Operation<T, U> {
  return operate<T, U>((obs) => {
    let index = 0;
    let subscription: Push.Subscription | null = null;
    let parentComplete = false;

    return [
      null,
      function next(value: T): void {
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
      null,
      function complete() {
        parentComplete = true;
        if (subscription && subscription.closed) obs.complete();
      },
      function teardown() {
        if (obs.closed || !parentComplete) {
          if (!subscription || subscription.closed) return;
          subscription.unsubscribe();
        }
      }
    ];
  });
}
