import { Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { getCompare } from '../../helpers/get-compare';
import { CompareOptions } from '../../types';

export function changes<T>(options?: CompareOptions): OperatorFunction<T, T> {
  const equal = getCompare(options);

  return (observable: Observable<T>): Observable<T> => {
    return observable.pipe(distinctUntilChanged(equal));
  };
}
