import { Push } from '@definitions';
import { Observable } from '../../classes/Observable';
import { transform } from '../../utils/transform';
import { intercept } from '../../utils/intercept';
import { from } from '../../creators/from';

export function catches<T, U = T>(
  selector: (err: Error, observable: Push.Observable<T>) => Push.Convertible<U>
): Push.Operation<T, T | U> {
  return transform((observable) => {
    return new Observable<T | U>((obs) => {
      const subscriptions: Push.Subscription[] = [];

      intercept(observable, obs, {
        start(subscription) {
          subscriptions.push(subscription);
        },
        error(reason: Error) {
          from(selector(reason, observable)).subscribe({
            start(subscription) {
              subscriptions.push(subscription);
            },
            next: obs.next.bind(obs),
            error: obs.error.bind(obs),
            complete: obs.complete.bind(obs)
          });
        }
      });

      return () => {
        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      };
    });
  });
}
