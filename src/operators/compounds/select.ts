import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { changes } from '../basics';
import { MapFn } from '../../types';

export function select<T, U extends object>(
  selector: MapFn<T, U>
): OperatorFunction<T, U> {
  return (observable: Observable<T>): Observable<U> => {
    return observable.pipe(map(selector), changes({ compare: 'shallow' }));
  };
}
