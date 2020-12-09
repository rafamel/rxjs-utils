import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { TypeGuard } from 'type-core';

export function throws<T = any>(error: string | Error): Push.Observable<T> {
  const err = TypeGuard.isString(error) ? Error(error) : error;
  return new Observable((obs) => obs.error(err));
}
