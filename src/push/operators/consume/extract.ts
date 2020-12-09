import { Push } from '@definitions';
import { transform } from '../../utils/transform';
import { take } from '../filter/take';
import { into } from 'pipettes';

/**
 * Returns the first synchronous value of an Observable,
 * `onEmpty` if none is produced, or `onError` if
 * the Observable errors synchronously.
 * If `onError` doesn't exist, `extract` will
 * synchronously throw.
 */
export function extract<T, U = void, V = U>(
  onEmpty?: U,
  onError?: V
): Push.Transformation<T, T | U | V> {
  return transform((observable) => {
    let value: any;
    let error: any;

    const subscription = into(observable, take(1)).subscribe({
      next(val) {
        value = [val];
      },
      error(reason) {
        error = [reason];
      }
    });

    subscription.unsubscribe();

    if (error) {
      if (onError) return onError;
      else throw error[0];
    }

    return value ? value[0] : (onEmpty as U);
  });
}
