import { Empty, Push } from '@definitions';
import { from } from '../creation/from';
import { operate } from '../utils/operate';

export function tap<T>(observer?: Push.Observer<T> | Empty): Push.Operation<T> {
  if (!observer) return (obs) => from(obs);
  return operate(() => observer, { multicast: true });
}
