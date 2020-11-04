import { Observables } from '../../../src/definitions';
import { Subscription } from './Subscription';

const $observer = Symbol('observer');

export function setSubscriptionObserver<T>(
  subscription: Subscription<T>,
  observer: Observables.Observer<T>
): void {
  (subscription as any)[$observer] = observer;
}

export function getSubscriptionObserver<T>(subscription: Subscription<T>): any {
  return (subscription as any)[$observer];
}

export function setSubscriptionClosed<T>(subscription: Subscription<T>): void {
  (subscription as any)[$observer] = null;
}

export function isSubscriptionClosed<T>(
  subscription: Subscription<T>
): boolean {
  return !(subscription as any)[$observer];
}
