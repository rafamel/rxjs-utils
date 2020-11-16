import { Push } from '@definitions';
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
    observer: Push.Observer<T>
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
    Observable: Push.ObservableConstructor,
    observable: Push.Observable<T> | Push.Like<T>
  ): Push.Observable<T> {
    return observable.constructor === Observable
      ? observable
      : new Observable((observer) => observable.subscribe(observer as any));
  }
  public static iterable<T>(
    Observable: Push.ObservableConstructor,
    iterable: Iterable<T>
  ): Push.Observable<T> {
    return new Observable<T>((observer) => {
      for (const item of iterable) {
        observer.next(item);
      }
      observer.complete();

      return () => undefined;
    });
  }
}
