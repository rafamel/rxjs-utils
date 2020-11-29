import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { TypeGuard } from 'type-core';

export function throws(error: string | Error): Push.Observable {
  const err = TypeGuard.isString(error) ? Error(error) : error;
  return new Observable((obs) => obs.error(err));
}
