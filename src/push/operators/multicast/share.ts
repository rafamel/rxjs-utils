import { Push } from '@definitions';
import { Multicast } from '../../classes/Multicast';
import { transform } from '../../utils/transform';
import { Empty, TypeGuard } from 'type-core';

export interface ShareOptions extends Multicast.Options {
  policy?: SharePolicy;
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
): Push.Transformation<T, Push.Multicast<T>> {
  const options = !policy || TypeGuard.isString(policy) ? { policy } : policy;

  return transform((observable) => {
    let count = 0;
    let observer: Push.SubscriptionObserver | Empty;
    let subscription: Push.Subscription | Empty;

    return new Multicast(
      (obs) => {
        observer = obs;
        return observable.subscribe(obs);
      },
      options,
      {
        onSubscribe(connect) {
          count++;
          subscription = connect();
        },
        onUnsubscribe() {
          count--;

          if (count > 0) return;
          switch (options.policy) {
            case 'keep-open': {
              return;
            }
            case 'keep-closed': {
              if (observer && !observer.closed) {
                const err = Error('Multicast is already closed');
                observer.error(err);
              }
              if (subscription) subscription.unsubscribe();
              return;
            }
            default: {
              if (subscription) subscription.unsubscribe();
              subscription = null;
            }
          }
        }
      }
    );
  });
}
