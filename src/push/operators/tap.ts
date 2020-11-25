import { Empty, Push } from '@definitions';
import { operate } from '../utils';

export function tap<T>(hearback?: Empty | Push.Hearback<T>): Push.Operation<T> {
  return operate(() => hearback, { multicast: true });
}
