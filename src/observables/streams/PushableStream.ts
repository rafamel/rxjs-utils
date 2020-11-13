import { Observables } from '@definitions';
import { PushStream } from './PushStream';

const $observer = Symbol('observer');

export class PushableStream<T = any> extends PushStream<T>
  implements Observables.Observable<T>, Observables.SubscriptionObserver<T> {
  private [$observer]: Observables.SubscriptionObserver<T>;
  public constructor() {
    super((tb) => {
      this[$observer] = tb;
    });
  }
  public get closed(): boolean {
    return this[$observer].closed;
  }
  public next(value: T): void {
    this[$observer].next(value);
  }
  public error(error: Error): void {
    this[$observer].error(error);
  }
  public complete(): void {
    this[$observer].complete();
  }
}
