import { Push } from '@definitions';
import { PushStream } from './PushStream';

const $observer = Symbol('observer');

export class PushableStream<T = any> extends PushStream<T>
  implements Push.Observable<T>, Push.SubscriptionObserver<T> {
  private [$observer]: Push.SubscriptionObserver<T>;
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
