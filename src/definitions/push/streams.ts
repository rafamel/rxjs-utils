import { Empty, Intersection, NoParamFn, UnaryFn } from '../types';
import {
  Observable,
  Subscription,
  SubscriptionObserver,
  Cleanup,
  ObserverLike
} from './observables';

/* Constructor */
export interface StreamConstructor {
  new <T = any>(producer: Producer<T>): Stream<T>;
  prototype: Stream;
}

/* Streams */
export interface Stream<T = any> extends Observable<T> {
  subscribe(hearback?: Empty | Hearback<T>): Broker;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Broker;
}

export type Pushable<T = any> = Intersection<Stream<T>, Talkback<T>>;

/* Hearback */
export interface Hearback<T = any> extends ObserverLike<T> {
  start?: (broker: Broker) => void;
  terminate?: NoParamFn;
}

/* Broker */
export type Broker = Intersection<Subscription, Promise<void>>;

/* Producer */
export type Producer<T = any> = (talkback: Talkback<T>) => Teardown;

/* Teardown */
export type Teardown =
  | Cleanup
  | NoParamFn<void | Promise<void>>
  | Array<Cleanup | NoParamFn<void | Promise<void>>>;

/* Talkback */
export type Talkback<T = any> = SubscriptionObserver<T>;
