import { Empty, NoParamFn, UnaryFn } from '../types';
import {
  Observable,
  Compatible,
  Observer,
  Subscription,
  SubscriptionObserver,
  Cleanup
} from './observables';

/* Constructor */
export interface StreamConstructor {
  new <T = any>(producer: Producer<T>): Stream<T>;
  of<T>(...items: T[]): Stream<T>;
  from<T>(item: Observable<T> | Compatible<T> | Iterable<T>): Stream<T>;
  prototype: Stream;
}

/* Stream */
export interface Stream<T = any> extends Observable<T> {
  subscribe(hearback?: Empty | Hearback<T>): Broker;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Broker;
}

/* Hearback */
export interface Hearback<T = any> extends Observer<T> {
  terminate?: NoParamFn;
}

/* Broker */
export type Broker = Subscription & Promise<void>;

/* Producer */
export type Producer<T = any> = (talkback: Talkback<T>) => Teardown;

/* Teardown */
export type Teardown =
  | Cleanup
  | NoParamFn<void | Promise<void>>
  | Array<Cleanup | NoParamFn<void | Promise<void>>>;

/* Talkback */
export type Talkback<T = any> = SubscriptionObserver<T>;
