import { Empty, NoParamFn, UnaryFn } from './types';
import 'symbol-observable';

export interface Constructor {
  new <T = any, R = void>(subscriber: Subscriber<T, R>): Observable<T, R>;
  of<T>(...items: T[]): Observable<T>;
  from<T, R = void>(
    item:
      | Subscriber<T, R>
      | Observable<T, R>
      | Compatible<T, R>
      | Like<T>
      | Iterable<T>
  ): Observable<T, R>;
  prototype: Observable;
}

export interface Like<T = any> {
  subscribe(observer: ObserverLike<T>): Subscription;
}

export type Compatible<T = any, R = void> = {
  [Symbol.observable]: () => Observable<T, R>;
};

export interface Observable<T = any, R = void>
  extends Compatible<T, R>,
    Like<T> {
  subscribe(observer: Observer<T, R>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<R>
  ): Subscription;
}

export interface Subscription {
  closed: boolean;
  unsubscribe(): void;
}

export interface ObserverLike<T = any> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Observer<T = any, R = void> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: (reason: R) => void;
}

export interface SubscriptionObserver<T = any, R = void> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(reason: R): void;
}

export type Subscriber<T = any, R = void> = (
  observer: SubscriptionObserver<T, R>
) => Teardown;

export type Teardown = Empty | NoParamFn | Subscription;
