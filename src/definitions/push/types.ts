import { Compatible, Like, Stream, Subscription, Observable } from './push';
import { BinaryFn, Empty, UnaryFn } from '../types';

export type Source<T = any> =
  | Like<T>
  | Compatible<T>
  | Observable<T>
  | Iterable<T>
  | PromiseLike<T>;

export interface Transformation<T, R> {
  (observable: Source<T>): R;
}

export type Operation<T, U = T> = Transformation<T, Stream<U>>;

export interface Hooks<T = any> {
  onUnhandledError?: Empty | BinaryFn<[Error, Subscription]>;
  onStoppedNotification?: Empty | BinaryFn<[T, Subscription]>;
  onCloseSubscription?: Empty | UnaryFn<Subscription>;
}
