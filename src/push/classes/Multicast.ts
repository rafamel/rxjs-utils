/* eslint-disable @typescript-eslint/no-use-before-define */
import { Push } from '@definitions';
import { HooksManager } from '../helpers';
import { from } from '../creators/from';
import { Invoke } from './helpers';
import { Observable } from './Observable';
import { NullaryFn, TypeGuard, UnaryFn } from 'type-core';

export interface MulticastOptions {
  replay?: boolean | number;
}

export interface MulticastHooks {
  onCreate?: UnaryFn<MulticastConnect>;
  onSubscribe?: UnaryFn<MulticastConnect>;
  onUnsubscribe?: UnaryFn<MulticastConnect>;
}

export type MulticastConnect = NullaryFn<Push.Subscription>;

export class Multicast<T = any, U extends T | void = T | void>
  extends Observable<T>
  implements Push.Multicast<T, U> {
  public static of<T>(item: T): Multicast<T, T>;
  public static of<T>(
    item: T,
    options?: MulticastOptions,
    hooks?: MulticastHooks
  ): Multicast<T, T>;
  public static of<T>(item: T, ...args: any[]): Multicast<T, T> {
    const options = args[0];
    const hooks = args[1];

    return new this<T, T>(
      (obs) => {
        obs.next(item);
        obs.complete();
      },
      hooks,
      options
    );
  }
  public static from<T>(
    item: Push.Convertible<T>,
    options?: MulticastOptions,
    hooks?: MulticastHooks
  ): Multicast<T> {
    if (item.constructor === this) return item;

    const observable = from(item);
    return new this<T>((obs) => observable.subscribe(obs), options, hooks);
  }
  #value: T | U;
  #termination: boolean | [Error];
  public constructor(
    subscriber: Push.Subscriber<T>,
    options?: MulticastOptions,
    hooks?: MulticastHooks
  ) {
    super((obs) => {
      const termination = this.#termination;
      if (termination) {
        return typeof termination === 'boolean'
          ? obs.complete()
          : obs.error(termination[0]);
      }

      for (const value of values) {
        obs.next(value);
      }

      items.add(obs);

      if (hooks) {
        const onSubscribe = hooks.onSubscribe;
        if (!TypeGuard.isEmpty(onSubscribe)) {
          onSubscribe.call(hooks, connect);
        }
      }

      return () => {
        items.delete(obs);

        if (hooks) {
          const onUnsubscribe = hooks.onUnsubscribe;
          if (!TypeGuard.isEmpty(onUnsubscribe)) {
            onUnsubscribe.call(hooks, connect);
          }
        }
      };
    });

    const opts = options || {};
    const items = new Set<Push.SubscriptionObserver<T>>();
    const values: T[] = [];
    const replay = Math.max(0, Number(opts.replay));
    const observable = new Observable(subscriber);
    this.#termination = false;

    let subscription: any;
    const connect = (): Push.Subscription => {
      if (subscription && (!subscription.closed || this.closed)) {
        return subscription;
      }

      return observable.subscribe({
        start: (subs) => (subscription = subs),
        next: (value) => {
          if (this.closed) return;

          this.#value = value;

          if (replay) {
            values.push(value);
            if (values.length > replay) values.shift();
          }

          Invoke.subscriptionObservers('next', value, items);
        },
        error: (error) => {
          if (this.closed) {
            const hooks = HooksManager.get();
            hooks.onUnhandledError(error, subscription);
          }

          this.#termination = [error];
          Invoke.subscriptionObservers('error', error, items);
        },
        complete: () => {
          if (this.closed) return;

          this.#termination = true;
          Invoke.subscriptionObservers('complete', undefined, items);
        }
      });
    };

    if (hooks) {
      try {
        const onCreate = hooks.onCreate;
        if (!TypeGuard.isEmpty(onCreate)) {
          onCreate.call(hooks, connect);
        }
      } catch (err) {
        this.#termination = [err];
      }
    }
  }
  public get value(): T | U {
    return this.#value;
  }
  public get closed(): boolean {
    return Boolean(this.#termination);
  }
  public [Symbol.observable](): Observable<T> {
    return Observable.from(this);
  }
}
