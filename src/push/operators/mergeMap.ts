import { Push } from '@definitions';
import { intercept, operate } from '../utils';

export function mergeMap<T, U>(
  projection: (value: T, index: number) => Push.Like<U> | Push.Compatible<U>
): Push.Operation<T, U> {
  return operate<T, U>((obs) => {
    let index = 0;
    let parentComplete = false;
    let completeSubscriptions = 0;
    const subscriptions: Push.Subscription[] = [];

    function unsubscribe(): void {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    }

    return {
      next(value: T): void {
        if (obs.closed) return;

        intercept(projection(value, index++), obs, {
          start(subscription) {
            subscriptions.push(subscription);
          },
          error(error) {
            obs.error(error);
            unsubscribe();
          },
          complete() {
            completeSubscriptions++;

            if (!parentComplete) return;
            if (completeSubscriptions >= subscriptions.length) {
              obs.complete();
              unsubscribe();
            }
          }
        });
      },
      complete() {
        parentComplete = true;
        if (completeSubscriptions >= subscriptions.length) {
          obs.complete();
        }
      },
      terminate() {
        if (obs.closed || !parentComplete) unsubscribe();
      }
    };
  });
}
