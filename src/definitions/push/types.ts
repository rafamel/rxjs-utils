import { Subscription, Observable, Convertible } from './observable';
import { BinaryFn, Empty } from 'type-core';

export type Transformation<T, R> = (observable: Convertible<T>) => R;
export type Operation<T, U = T> = Transformation<T, Observable<U>>;

export interface Hooks<T = any> {
  onUnhandledError?: Empty | BinaryFn<[Error, Subscription]>;
  onStoppedNotification?: Empty | BinaryFn<[T, Subscription]>;
}
