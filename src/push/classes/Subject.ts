import { Push } from '@definitions';
import { Accessor } from '@helpers';
import { from } from '../creators/from';
import { tap } from '../operators/tap';
import { Multicast } from './Multicast';
import { into } from 'pipettes';

/** @ignore */
const $observer = Symbol('observer');

export declare namespace Subject {
  export type Options<U> = Multicast.Options<U>;
}

export class Subject<T = any, U extends T | void = T | void>
  extends Multicast<T, U>
  implements Push.Subject<T, U> {
  public static of<T>(item: T, options?: Subject.Options<T>): Subject<T, T> {
    const subject = new this<T, T>(options);
    subject.next(item);
    return subject;
  }
  public static from<T, U extends T | void = T | void>(
    item: Push.Convertible<T>,
    options?: Subject.Options<U>
  ): Subject<T, U> {
    if (item.constructor === this) return item;

    const observable = from(item);
    const subject = new this(options);

    let subscription: any;
    into(observable, tap({ start: (subs) => (subscription = subs) })).subscribe(
      subject
    );

    subject.subscribe({
      error: subscription.unsubscribe.bind(subscription),
      complete: subscription.unsubscribe.bind(subscription)
    });

    return subject;
  }
  private [$observer]: Push.SubscriptionObserver<T>;
  public constructor(options?: Subject.Options<U>) {
    let observer: any;
    super(
      (obs) => {
        observer = obs;
      },
      options,
      { onCreate: (connect) => connect() }
    );
    Accessor.define(this, $observer, observer);
  }
  public next(value: T): void {
    return this[$observer].next(value);
  }
  public error(error: Error): void {
    return this[$observer].error(error);
  }
  public complete(): void {
    return this[$observer].complete();
  }
}
