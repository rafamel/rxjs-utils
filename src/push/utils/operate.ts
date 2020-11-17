import { Push } from '@definitions';
import { PushStream } from '../streams';

export function operate<T, R>(
  operation: (observable: Push.Stream<T>) => R
): Push.Operation<T, R> {
  return function(source: Push.Compatible<T> | Push.Like<T>): R {
    return operation(PushStream.from(source));
  };
}
