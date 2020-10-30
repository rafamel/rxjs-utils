import * as Core from './core';
import * as Observables from './observables';
import { NoParamFn, UnaryFn } from './types';

export interface Constructor extends Observables.Constructor {
  new <T = any, R = void>(subscriber: Subscriber<T, R>): Stream<T, R>;
  of<T>(...items: T[]): Stream<T>;
  from<T, R = void>(
    item:
      | Observables.Subscriber<T, R>
      | Observables.Observable<T, R>
      | Observables.Compatible<T, R>
      | Observables.Like<T>
      | Iterable<T>
  ): Stream<T, R>;
  prototype: Stream;
}

export interface Stream<T = any, R = void>
  extends Core.Stream<T, R>,
    Observables.Observable<T, R> {
  subscribe(observer: Observer<T, R>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: UnaryFn<R>,
    onTerminate?: NoParamFn
  ): Subscription;
}

export type Subscription = Observables.Subscription;

export interface Observer<T = any, R = void>
  extends Observables.Observer<T, R> {
  terminate?: () => void;
}

export type Talkback<T = any, R = void> = Core.Talkback<T, R> &
  Observables.SubscriptionObserver<T, R>;

export type Subscriber<T = any, R = void> = (
  observer: Talkback<T, R>
) => Teardown;

export type Teardown = Observables.Teardown;
