import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { Subject } from '../classes/Subject';
import { transform } from '../utils/transform';

export interface ConnectOptions {
  replay?: boolean | number;
}

/**
 * Creates a new Observable that multicasts the original Observable.
 * The original Observable will be immediately subscribed,
 * and will continue to be even if there are no subscribers.
 */
export function connect<T>(options?: ConnectOptions): Push.Operation<T> {
  return transform((source) => {
    const subject = new Subject(options);
    source.subscribe(subject);
    return new Observable((obs) => subject.subscribe(obs));
  });
}
