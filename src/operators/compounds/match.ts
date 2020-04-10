import { Observable, OperatorFunction } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { changes, pick } from '../basics';
import { getCompare } from '../../helpers/get-compare';
import { CompareOptions } from '../../types';

export interface MatchOptions extends CompareOptions {
  pick?: boolean | null;
  debounce?: number | null;
}

export function match<T, U>(
  value: T,
  options?: MatchOptions
): OperatorFunction<U, boolean> {
  const equal = getCompare(options);

  return (observable: Observable<U>): Observable<boolean> => {
    return observable.pipe(
      map((item) => equal(value, item)),
      changes(),
      options && typeof options.debounce === 'number'
        ? debounceTime(Math.max(0, options.debounce))
        : (x) => x,
      options && typeof options.pick === 'boolean'
        ? pick(options.pick)
        : (x) => x
    );
  };
}
