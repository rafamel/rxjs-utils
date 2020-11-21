import { Empty, Push } from '@definitions';
import { from } from '../creation';
import { Talkback } from '../streams';

export interface InterceptOptions {
  multicast?: boolean;
}

export function intercept<T, U>(
  options: InterceptOptions | Empty,
  observable: Push.Like<T> | Push.Compatible<T>,
  observer: Push.SubscriptionObserver<U>,
  hearback: Push.Hearback<T>,
  ...hearbacks: Array<Push.Hearback<T>>
): Push.Subscription {
  const stream = from(observable);

  const talkback = new Talkback({
    multicast: options ? options.multicast : false,
    report: (err) => observer.error(err)
  });

  talkback.add(hearback);
  if (hearbacks.length) talkback.add(...hearbacks);
  talkback.add(observer);

  return stream.subscribe(talkback);
}
