import { Empty, Push, UnaryFn } from '@definitions';
import { Forwarder, PushStream } from '../streams';

export function intercept<T>(
  observable: Push.Like<T> | Push.Compatible<T>,
  talkback: Push.Talkback<T>,
  hearback?: Push.Hearback<T> | Empty,
  duplicate?: boolean | Empty
): Push.Broker;

export function intercept<T, U>(
  observable: Push.Like<T> | Push.Compatible<T>,
  talkback: Push.Talkback<U>,
  hearback: (Push.Hearback<T> & Record<'next', UnaryFn<T>>) | Empty,
  duplicate?: boolean | Empty
): Push.Broker;

export function intercept(
  observable: Push.Like | Push.Compatible,
  talkback: Push.Talkback,
  hearback?: Push.Hearback | Empty,
  duplicate?: boolean | Empty
): Push.Broker {
  const stream = PushStream.from(observable);
  return hearback
    ? stream.subscribe(new Forwarder(talkback, hearback, duplicate))
    : stream.subscribe(talkback);
}
