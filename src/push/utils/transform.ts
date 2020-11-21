import { Push } from '@definitions';
import { from } from '../creation';

export function transform<T, R>(
  transformation: (observable: Push.Stream<T>) => R
): Push.Transformation<T, R> {
  return function (source: Push.Compatible<T> | Push.Like<T>): R {
    return transformation(from(source));
  };
}
