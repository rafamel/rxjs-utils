import { Empty, Push } from '@definitions';
import { intercept, transform } from '../utils';
import { PushStream } from '../stream';

export function tap<T>(hearback?: Empty | Push.Hearback<T>): Push.Operation<T> {
  return transform((stream) => {
    if (!hearback) return stream;
    return new PushStream((tb) => {
      return intercept({ multicast: true }, stream, tb, hearback);
    });
  });
}
