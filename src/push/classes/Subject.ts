import { Push } from '@definitions';
import { tap } from '../operators/tap';
import { Invoke } from './helpers';
import { Observable } from './Observable';
import { into } from 'pipettes';

export interface SubjectOptions {
  replay?: boolean | number;
}

export class Subject<T = any> extends Observable<T> implements Push.Subject<T> {
  public static from<T>(
    item: Push.Convertible<T>,
    options?: SubjectOptions
  ): Subject<T> {
    const obs = super.from(item);
    const subject = new this(options);

    let subscription: any;
    into(obs, tap({ start: (subs) => (subscription = subs) })).subscribe(
      subject
    );

    subject.subscribe({
      error: subscription.unsubscribe.bind(subscription),
      complete: subscription.unsubscribe.bind(subscription)
    });

    return subject;
  }
  #items: Set<Push.SubscriptionObserver<T>>;
  #replay: number;
  #value: T | void;
  #values: T[];
  #termination: boolean | [Error];
  public constructor(options?: SubjectOptions) {
    super((obs) => {
      const termination = this.#termination;
      if (termination) {
        return typeof termination === 'boolean'
          ? obs.complete()
          : obs.error(termination[0]);
      }

      for (const value of this.#values) {
        obs.next(value);
      }

      const items = this.#items;
      items.add(obs);
      return () => items.delete(obs);
    });

    const opts = options || {};
    this.#items = new Set();
    this.#replay = Math.max(0, Number(opts.replay));
    this.#values = [];
    this.#termination = false;
  }
  public get value(): T | void {
    return this.#value;
  }
  public get closed(): boolean {
    return Boolean(this.#termination);
  }
  public [Symbol.observable](): Observable<T> {
    return Observable.from(this);
  }
  public next(value: T): void {
    if (this.closed) return;

    this.#value = value;

    const replay = this.#replay;
    if (replay) {
      const values = this.#values;
      values.push(value);
      if (values.length > replay) values.shift();
    }

    Invoke.subscriptionObservers('next', value, this.#items);
  }
  public error(error: Error): void {
    if (this.closed) return;

    this.#termination = [error];
    Invoke.subscriptionObservers('error', error, this.#items);
  }
  public complete(): void {
    if (this.closed) return;

    this.#termination = true;
    Invoke.subscriptionObservers('complete', undefined, this.#items);
  }
}
