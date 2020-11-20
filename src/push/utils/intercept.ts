import { Empty, Push } from '@definitions';
import { Router, from } from '../stream';

export interface InterceptOptions {
  multicast?: boolean;
}

export function intercept<T, U>(
  options: InterceptOptions | Empty,
  observable: Push.Like<T> | Push.Compatible<T>,
  talkback: Push.Talkback<U>,
  hearback: Push.Hearback<T>,
  ...hearbacks: Array<Push.Hearback<T>>
): Push.Broker {
  const stream = from(observable);

  const router = new Router<any>({
    multicast: options ? options.multicast : false,
    report: (err) => talkback.error(err)
  });

  router.add(hearback);
  if (hearbacks.length) router.add(...hearbacks);
  router.add(talkback);

  return stream.subscribe(router);
}
