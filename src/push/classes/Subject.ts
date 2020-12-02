import { Push } from '@definitions';
import { Accessor } from '@helpers';
import { from } from '../creators/from';
import { tap } from '../operators/tap';
import { Multicast, MulticastOptions } from './Multicast';
import { into } from 'pipettes';

export type SubjectOptions = MulticastOptions;

const $observer = Symbol('observer');

export class Subject<T = any, U extends T | void = T | void>
  extends Multicast<T, U>
  implements Push.Subject<T, U> {
  public static of<T>(item: T, options?: SubjectOptions): Subject<T, T> {
    const subject = new this<T, T>(options);
    subject.next(item);
    return subject;
  }
  public static from<T>(
    item: Push.Convertible<T>,
    options?: SubjectOptions
  ): Subject<T> {
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
  public constructor(options?: SubjectOptions) {
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
