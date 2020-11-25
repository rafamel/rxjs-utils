import { Push } from '@definitions';
import { from } from '../creation';
import { Talkback } from '../streams';

export interface InterceptOptions {
  /** See TalkbackOptions.multicast */
  multicast: boolean;
}

export function intercept<T, U>(
  observable: Push.Source<T>,
  observer: Push.SubscriptionObserver<U>,
  hearback: Push.Hearback<T>,
  options?: InterceptOptions
): Push.Subscription {
  return from(observable).subscribe(
    new Talkback<any>([hearback, observer], {
      multicast: options && options.multicast,
      onError: observer.error.bind(observer)
    })
  );
}
