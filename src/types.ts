import { EqualityKind } from 'equal-strategies';

export interface CompareOptions {
  compare?: EqualityKind;
}

export type MapFn<T, U> = (value: T) => U;
