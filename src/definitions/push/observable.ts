import { Empty, NullaryFn, UnaryFn } from 'type-core';
import 'symbol-observable';

/* Constructor */
export interface LikeConstructor {
  new <T = any>(subscriber: Subscriber<T>): Like<T>;
  prototype: Like;
}

export interface ObservableConstructor extends LikeConstructor {
  new <T = any>(subscriber: Subscriber<T>): Observable<T>;
  of<T>(...items: T[]): Observable<T>;
  from<T>(item: Convertible<T>): Observable<T>;
  prototype: Observable;
}

/* Observable */
export type Convertible<T = any> = Like<T> | Compatible<T> | Iterable<T>;

export interface Like<T = any> {
  subscribe(observer: ObserverLike<T>): SubscriptionLike;
}

export type Compatible<T = any> = {
  [Symbol.observable]: () => Observable<T>;
};

export interface Observable<T = any> extends Compatible<T>, Like<T> {
  subscribe(observer?: Observer<T>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NullaryFn
  ): Subscription;
}

export interface Multicast<T = any, U extends T | void = T | void>
  extends Observable<T> {
  value: T | U;
  closed: boolean;
}

export type Subject<T = any, U extends T | void = T | void> = Observable<T> &
  SubscriptionObserver<T> &
  Multicast<T, U>;

/* Observer */
export interface ObserverLike<T = any> {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Observer<T = any> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Talkback<T = any> extends Observer<T> {
  start(subscription: Subscription): void;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface SubscriptionObserver<T = any> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

/* Subscription */
export interface SubscriptionLike {
  unsubscribe(): void;
}

export interface Subscription extends SubscriptionLike {
  closed: boolean;
}

/* Subscriber */
export type Subscriber<T = any> = (
  observer: SubscriptionObserver<T>
) => Teardown;

/* Teardown */
export type Teardown = Empty | NullaryFn | SubscriptionLike;
