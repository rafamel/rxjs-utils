import { Empty, NoParamFn, UnaryFn } from '../types';
import 'symbol-observable';
import { Hooks } from './types';

/* Constructors */
export interface LikeConstructor {
  new <T = any>(subscriber: Subscriber<T>): Like<T>;
  prototype: Like;
}

export interface ObservableConstructor extends LikeConstructor {
  new <T = any>(subscriber: Subscriber<T>): Observable<T>;
  of<T>(...items: T[]): Observable<T>;
  from<T>(item: Observable<T> | Compatible<T> | Iterable<T>): Observable<T>;
  prototype: Observable;
}

export interface StreamConstructor {
  new <T = any>(subscriber: Subscriber<T>): Stream<T>;
  configure(hooks?: Hooks): void;
  prototype: Stream;
}

/* Streams */
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
    onComplete?: NoParamFn
  ): Subscription;
}

export interface Stream<T = any> extends Observable<T> {
  subscribe(hearback?: Empty | Hearback<T>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Subscription;
}

export interface Pushable<T = any> extends Stream<T> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface Connectable<T = any> extends Stream<T> {
  size: number;
  connect(): void;
  disconnect(): void;
}

/* Observer */
export interface ObserverLike<T = any> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Observer<T = any> extends ObserverLike<T> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Hearback<T = any> extends Observer<T> {
  terminate?: () => void;
}

export interface SubscriptionObserver<T = any> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface Talkback<T = any> extends SubscriptionObserver<T> {
  start(subscription: Subscription): void;
  terminate(): void;
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
export type Teardown = Empty | NoParamFn | SubscriptionLike;
