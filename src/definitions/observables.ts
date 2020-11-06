import { Empty, NoParamFn, UnaryFn } from './types';
import 'symbol-observable';

export interface Constructor {
  new <T = any>(subscriber: Subscriber<T>): Observable<T>;
  of<T>(...items: T[]): Observable<T>;
  from<T>(
    item: Subscriber<T> | Observable<T> | Compatible<T> | Like<T> | Iterable<T>
  ): Observable<T>;
  prototype: Observable;
}

export interface Like<T = any> {
  subscribe(observer: ObserverLike<T>): Subscription;
}

export type Compatible<T = any> = {
  [Symbol.observable]: () => Observable<T>;
};

export interface Observable<T = any> extends Compatible<T>, Like<T> {
  subscribe(observer?: Observer<T>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn
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

export interface Observer<T = any> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface SubscriptionObserver<T = any> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export type Subscriber<T = any> = (
  observer: SubscriptionObserver<T>
) => Teardown;

export type Teardown = Empty | NoParamFn | Subscription;
