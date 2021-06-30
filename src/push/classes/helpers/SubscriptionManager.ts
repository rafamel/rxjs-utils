import { Push } from '@definitions';
import { Accessor } from '@helpers';
import { Subscription } from '../assistance';
import { Dictionary } from 'type-core';

const $observer = Symbol('observer');

export class SubscriptionManager {
  public static setObserver<T>(
    subscription: Subscription<T>,
    observer: Push.Observer<T>
  ): void {
    Accessor.define(subscription, $observer, observer);
  }
  public static getObserver<T>(subscription: Subscription<T>): Dictionary {
    return (subscription as any)[$observer] as Dictionary;
  }
  public static close<T>(subscription: Subscription<T>): void {
    Accessor.define(subscription, $observer, null);
  }
  public static isClosed<T>(subscription: Subscription<T>): boolean {
    return this.getObserver(subscription) === null;
  }
}
