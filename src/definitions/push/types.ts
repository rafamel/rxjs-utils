import { Compatible, Like } from './observables';

export interface Operation<T, R> {
  (observable: Like<T> | Compatible<T>): R;
}
