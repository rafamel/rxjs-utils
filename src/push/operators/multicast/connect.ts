import { Push } from '@definitions';
import { Multicast } from '../../classes/Multicast';
import { transform } from '../../utils/transform';

export type ConnectOptions<U> = Multicast.Options<U>;

/**
 * Creates a new Observable that multicasts the original Observable.
 * The original Observable will be immediately subscribed,
 * and will continue to be even if there are no subscribers.
 */
export function connect<T, U extends T | void = T | void>(
  options?: ConnectOptions<U>
): Push.Transformation<T, Push.Multicast<T, U>> {
  return transform((source) => {
    return Multicast.from(source, options, {
      onCreate: (connect) => connect()
    });
  });
}
