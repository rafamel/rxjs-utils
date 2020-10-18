import { NopFn, UnaryFn } from './types';
import 'symbol-observable';

export type ObservableSymbol = '@@observable';

export interface Constructor {
  new <T = any, S = void>(subscriber: Subscriber<T, S>): Observable<T, S>;
  of<T>(...items: T[]): Observable<T>;
  from<T, S = void>(
    item:
      | Subscriber<T, S>
      | Observable<T, S>
      | Compatible<T, S>
      | Like<T>
      | Iterable<T>
  ): Observable<T, S>;
  prototype: Observable;
}

export interface Like<T = any> {
  subscribe(observer: ObserverLike<T>): Subscription;
}

export type Compatible<T = any, S = void> = {
  [Symbol.observable]: () => Observable<T, S>;
};

export interface Observable<T = any, S = void>
  extends Compatible<T, S>,
    Like<T> {
  subscribe(observer: Observer<T, S>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<S>
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

export interface Observer<T = any, S = void> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: (signal: S) => void;
}

export interface SubscriptionObserver<T = any, S = void> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(signal: S): void;
}

export type Subscriber<T = any, S = void> = (
  observer: SubscriptionObserver<T, S>
) => NopFn | Subscription;
