import { Push, UnaryFn } from '@definitions';
import { PushStream } from '../streams';

export function forward<T>(
  from: Push.Like<T> | Push.Compatible<T>,
  to: Push.Talkback<T>,
  hearback?: Push.Hearback<T>
): Push.Broker;

export function forward<T, U>(
  from: Push.Like<T> | Push.Compatible<T>,
  to: Push.Talkback<U>,
  hearback: Push.Hearback<T> & Record<'next', UnaryFn<T>>
): Push.Broker;

export function forward(
  from: Push.Like | Push.Compatible,
  to: Push.Talkback,
  hearback?: Push.Hearback
): Push.Broker {
  const stream = PushStream.from(from);
  if (!hearback) return stream.subscribe(to);

  const start = hearback.start;
  const next = hearback.next;
  const error = hearback.error;
  const complete = hearback.complete;
  const terminate = hearback.terminate;

  return stream.subscribe({
    start: start ? start.bind(hearback) : undefined,
    next: next ? next.bind(hearback) : to.next.bind(to),
    error: error ? error.bind(hearback) : to.error.bind(to),
    complete: complete ? complete.bind(hearback) : to.complete.bind(to),
    terminate: terminate ? terminate.bind(hearback) : undefined
  });
}
