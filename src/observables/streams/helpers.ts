import { Observables } from '@definitions';
import { FailureManager } from '@helpers';
import { Subscription } from './Subscription';

const $observer = Symbol('observer');
const $failure = Symbol('failure');

export class ManageSubscription {
  public static setFailureManager(
    subscription: Subscription<any>,
    manager: FailureManager
  ): void {
    (subscription as any)[$failure] = manager;
  }
  public static getFailureManager(
    subscription: Subscription<any>
  ): FailureManager {
    return (subscription as any)[$failure];
  }
  public static setSubscriptionObserver<T>(
    subscription: Subscription<T>,
    observer: Observables.Observer<T>
  ): void {
    (subscription as any)[$observer] = observer;
  }
  public static getSubscriptionObserver<T>(subscription: Subscription<T>): any {
    return (subscription as any)[$observer];
  }
  public static closeSubscriptionObserver<T>(
    subscription: Subscription<T>
  ): void {
    (subscription as any)[$observer] = null;
  }
  public static isSubscriptionObserverClosed<T>(
    subscription: Subscription<T>
  ): boolean {
    return !(subscription as any)[$observer];
  }
}

export class ObservableFrom {
  public static like<T>(
    Observable: Observables.ObservableConstructor,
    observable: Observables.Observable<T> | Observables.Like<T>
  ): Observables.Observable<T> {
    return observable.constructor === Observable
      ? observable
      : new Observable((observer) => observable.subscribe(observer as any));
  }
  public static iterable<T>(
    Observable: Observables.ObservableConstructor,
    iterable: Iterable<T>
  ): Observables.Observable<T> {
    return new Observable<T>((observer) => {
      for (const item of iterable) {
        observer.next(item);
      }
      observer.complete();

      return () => undefined;
    });
  }
}
