import { Push } from '@definitions';
import { Talkback } from './assistance';
import { PushStream } from './PushStream';

const $talkback = Symbol('router');

export class PushableStream<T = any>
  extends PushStream<T>
  implements Push.Pushable<T> {
  private [$talkback]: Talkback<T>;
  public constructor() {
    const talkback = new Talkback<T>({ multicast: true });
    super((tb) => {
      if (this.closed) {
        tb.error(Error(`Stream is already closed`));
        return null;
      } else {
        talkback.add(tb);
        return () => talkback.delete(tb);
      }
    });
    this[$talkback] = talkback;
  }
  public get closed(): boolean {
    return this[$talkback].closed;
  }
  public next(value: T): void {
    return this[$talkback].next(value);
  }
  public error(error: Error): void {
    return this[$talkback].error(error);
  }
  public complete(): void {
    return this[$talkback].complete();
  }
}
