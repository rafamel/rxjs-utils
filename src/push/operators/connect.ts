import { Push } from '@definitions';
import { PushableStream, PushStream } from '../streams';
import { transform } from '../utils';

export interface ConnectOptions {
  replay: boolean | number;
}

/**
 * Creates a PushStream that multicasts the original Observable.
 * The original Observable will be immediately subscribed,
 * and will continue to be even if there are no subscribers.
 */
export function connect<T>(options?: ConnectOptions): Push.Operation<T> {
  return transform((stream) => {
    const pushable = new PushableStream(options);
    stream.subscribe(pushable);
    return new PushStream((obs) => pushable.subscribe(obs));
  });
}
