import { Push } from '@definitions';
import { transform } from '../../utils/transform';
import { take } from '../filter/take';
import { into } from 'pipettes';

export function first<T>(strict: true): Push.Transformation<T, Promise<T>>;
export function first<T>(
  strict?: boolean
): Push.Transformation<T, Promise<T | void>>;

/**
 * Returns a *Promise* of the first value an *Observable* emits.
 * Such *Promise* will reject if the *Observable* errors
 * before emitting a value.
 * @param strict if `true`, the returned *Promise* will reject if the *Observable* completes before emitting a value instead of resolving with undefined.
 */
export function first<T>(
  strict?: boolean
): Push.Transformation<T, Promise<T | void>> {
  return transform((observable) => {
    let emitted = false;
    return new Promise((resolve, reject) => {
      into(observable, take(1)).subscribe({
        next(value) {
          emitted = true;
          resolve(value);
        },
        error(reason) {
          emitted = true;
          reject(reason);
        },
        complete() {
          if (emitted) return;
          if (strict) {
            reject(Error(`Observable completed before emitting a value`));
          } else {
            resolve();
          }
        }
      });
    });
  });
}
