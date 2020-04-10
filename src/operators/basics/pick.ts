import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getCompare } from '../../helpers/get-compare';
import { CompareOptions } from '../../types';

export function pick<T, U>(
  value: U,
  options?: CompareOptions
): OperatorFunction<T, Extract<T, U>> {
  const equal = getCompare(options);

  return (observable: Observable<T>): Observable<Extract<T, U>> => {
    return observable.pipe(
      filter((item): item is Extract<T, U> => equal(value, item))
    );
  };
}
