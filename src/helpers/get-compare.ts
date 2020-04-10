import { compare } from 'equal-strategies';
import { CompareOptions } from '../types';

export function getCompare(
  options?: CompareOptions
): (a: any, b: any) => boolean {
  return compare.bind(null, (options && options.compare) || 'strict');
}
