import { Push } from '@definitions';
import { Multicast } from '../../classes/Multicast';
import { transform } from '../../utils/transform';

export type ConnectOptions = Multicast.Options;

/**
 * Creates a new Observable that multicasts the original Observable.
 * The original Observable will be immediately subscribed,
 * and will continue to be even if there are no subscribers.
 */
export function connect<T>(
  options?: ConnectOptions
): Push.Transformation<T, Push.Multicast<T>> {
  return transform((source) => {
    return Multicast.from(source, options, {
      onCreate: (connect) => connect()
    });
  });
}
