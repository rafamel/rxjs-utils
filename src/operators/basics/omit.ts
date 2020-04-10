import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getCompare } from '../../helpers/get-compare';
import { CompareOptions } from '../../types';

export function omit<T, U>(
  value: U,
  options?: CompareOptions
): OperatorFunction<T, Exclude<T, U>> {
  const equal = getCompare(options);

  return (observable: Observable<T>): Observable<Exclude<T, U>> => {
    return observable.pipe(
      filter((item): item is Exclude<T, U> => !equal(value, item))
    );
  };
}
