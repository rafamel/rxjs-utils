import { Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { PushableStream, PushStream } from '../streams';
import { transform } from '../utils';

export interface ShareOptions {
  policy?: SharePolicy;
  replay?: boolean | number;
}

/**
 * 'on-demand': Default policy. Subscribes and re-subscribes to the original Observable once the resulting PushStream has open subscriptions, so long as the original Observable hasn't errored or completed on previous subscriptions. Unsubscribes from the original Observable once the resulting PushStream has no active subscriptions.
 * 'keep-open': Keeps the parent subscription open even if it has no current subscriptions.
 * 'keep-closed': Permanently unsubscribes from the original Observable once the resulting PushStreams has no active subscriptions. Subsequent subscriptions will error or complete immediately with the same signal as the original Observable if it finalized before being unsubscribed, or otherwise error.
 */
export type SharePolicy = 'on-demand' | 'keep-open' | 'keep-closed';

/**
 * Creates a PushStream that multicasts the original Observable.
 * The original Observable won't be subscribed until there is at least
 * one subscriber.
 */
export function share<T>(
  policy?: SharePolicy | ShareOptions
): Push.Operation<T> {
  const options = !policy || TypeGuard.isString(policy) ? { policy } : policy;

  return transform((stream) => {
    let count = 0;
    let subscription: null | Push.Subscription = null;

    const pushable = new PushableStream(options);
    return new PushStream((obs) => {
      count++;
      const subs = pushable.subscribe(obs);

      if (!subscription && !pushable.closed) {
        subscription = stream.subscribe(pushable);
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
            pushable.error(Error('Multicasted subscription is already closed'));
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
