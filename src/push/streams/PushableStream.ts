import { Push } from '@definitions';
import { Talkback } from './assistance';
import { PushStream } from './PushStream';

export class PushableStream<T = any>
  extends PushStream<T>
  implements Push.Pushable<T> {
  #talkback: Talkback<T>;
  public constructor() {
    super((tb) => {
      if (this.closed) {
        tb.error(Error(`Stream is already closed`));
        return null;
      } else {
        this.#talkback.add(tb);
        return () => this.#talkback.delete(tb);
      }
    });

    this.#talkback = new Talkback<T>({ multicast: true });
  }
  public get closed(): boolean {
    return this.#talkback.closed;
  }
  public next(value: T): void {
    return this.#talkback.next(value);
  }
  public error(error: Error): void {
    return this.#talkback.error(error);
  }
  public complete(): void {
    return this.#talkback.complete();
  }
}
