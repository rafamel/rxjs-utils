import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { Observable, Subject } from '../classes';
import { transform } from '../utils';

export interface ShareOptions {
  policy?: SharePolicy;
  replay?: boolean | number;
}

/**
 * 'on-demand': Default policy. Subscribes and re-subscribes to the original Observable once the resulting one has open subscriptions, so long as the original Observable hasn't errored or completed on previous subscriptions. Unsubscribes from the original Observable once the resulting Observable has no active subscriptions.
 * 'keep-open': Keeps the parent subscription open even if it has no current subscriptions.
 * 'keep-closed': Permanently unsubscribes from the original Observable once the resulting one has no active subscriptions. Subsequent subscriptions will error or complete immediately with the same signal as the original Observable if it finalized before being unsubscribed, or otherwise error.
 */
export type SharePolicy = 'on-demand' | 'keep-open' | 'keep-closed';

/**
 * Creates an Observable that multicasts the original Observable.
 * The original Observable won't be subscribed until there is at least
 * one subscriber.
 */
export function share<T>(
  policy?: SharePolicy | ShareOptions
): Push.Operation<T> {
  const options = !policy || TypeGuard.isString(policy) ? { policy } : policy;

  return transform((observable) => {
    let count = 0;
    let subscription: null | Push.Subscription = null;

    const subject = new Subject(options);
    return new Observable((obs) => {
      count++;
      const subs = subject.subscribe(obs);

      if (!subscription && !subject.closed) {
        subscription = observable.subscribe(subject);
      }
      return () => {
        count--;
        subs.unsubscribe();

        if (count > 0) return;

        switch (options.policy) {
          case 'keep-open': {
            return;
          }
          case 'keep-closed': {
            if (subscription) subscription.unsubscribe();
            subject.error(Error('Multicasted subscription is already closed'));
            return;
          }
          default: {
            if (subscription) subscription.unsubscribe();
            subscription = null;
          }
        }
      };
    });
  });
}
