import { Empty, NoParamFn, UnaryFn } from '../types';
import {
  Observable,
  Compatible,
  Observer,
  Subscription,
  SubscriptionObserver,
  Teardown
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
  // TODO: implement finally
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn
  ): Broker;
}

/* Hearback */
// TODO: implement finally
export type Hearback<T = any> = Observer<T>;

/* Broker */
export type Broker = Subscription & Promise<void>;

/* Producer */
export type Producer<T = any> = (talkback: Talkback<T>) => Terminate;

export type Terminate =
  | Teardown
  | NoParamFn<void | Promise<void>>
  | Array<Teardown | NoParamFn<void | Promise<void>>>;

/* Talkback */
export type Talkback<T = any> = SubscriptionObserver<T>;
