import { Push } from '@definitions';
import { filter } from './filter';
import { compare } from 'equal-strategies';

export type OmitStrategy = 'strict' | 'shallow' | 'deep';

export function omit<T, U>(
  value: U,
  strategy?: OmitStrategy
): Push.Operation<T, Exclude<T, U>> {
  const fn = compare.bind(null, strategy || 'strict', value);
  return filter((x) => !fn(x)) as Push.Operation<T, Exclude<T, U>>;
}
