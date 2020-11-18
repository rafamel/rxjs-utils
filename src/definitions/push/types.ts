import { Stream } from './streams';
import { Compatible, Like } from './observables';

export interface Transformation<T, R> {
  (observable: Like<T> | Compatible<T>): R;
}

export type Operation<T, U = T> = Transformation<T, Stream<U>>;
