import { Push } from '@definitions';
import { filter } from './filter';
import { compare } from 'equal-strategies';

export type PickStrategy = 'strict' | 'shallow' | 'deep';

export function pick<T, U>(
  value: U,
  strategy?: PickStrategy
): Push.Operation<T, Extract<T, U>> {
  const fn = compare.bind(null, strategy || 'strict', value);
  return filter(fn);
}
