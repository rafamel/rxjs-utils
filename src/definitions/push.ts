import * as Core from './core';
import * as Observables from './observables';
import { NoParamFn, UnaryFn } from './types';

export interface Constructor extends Observables.Constructor {
  new <T = any>(subscriber: Subscriber<T>): Stream<T>;
  of<T>(...items: T[]): Stream<T>;
  from<T>(
    item:
      | Observables.Subscriber<T>
      | Observables.Observable<T>
      | Observables.Compatible<T>
      | Observables.Like<T>
      | Iterable<T>
  ): Stream<T>;
  prototype: Stream;
}

export interface Stream<T = any>
  extends Core.Stream<T>,
    Observables.Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Subscription;
}

export type Subscription = Observables.Subscription;

export interface Observer<T = any> extends Observables.Observer<T> {
  terminate?: () => void;
}

export type Talkback<T = any> = Core.Talkback<T> &
  Observables.SubscriptionObserver<T>;

export type Subscriber<T = any> = (observer: Talkback<T>) => Teardown;

export type Teardown = Observables.Teardown;
