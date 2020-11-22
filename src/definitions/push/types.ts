import { Compatible, Like, Stream, Subscription } from './push';
import { BinaryFn, Empty, UnaryFn } from '../types';

export interface Hooks<T = any> {
  onUnhandledError?: Empty | BinaryFn<[Error, Subscription]>;
  onStoppedNotification?: Empty | BinaryFn<[T, Subscription]>;
  onCloseSubscription?: Empty | UnaryFn<Subscription>;
}

export interface Transformation<T, R> {
  (observable: Like<T> | Compatible<T>): R;
}

export type Operation<T, U = T> = Transformation<T, Stream<U>>;
