import { Push } from '@definitions';
import { Talkback } from './assistance';
import { PushStream } from './PushStream';

export class PushableStream<T = any>
  extends PushStream<T>
  implements Push.Pushable<T> {
  #talkback: Talkback<T>;
  public constructor() {
    super((obs) => {
      const talkback = this.#talkback;
      if (this.closed) {
        obs.error(Error(`Stream is already closed`));
        return null;
      } else {
        talkback.add(obs);
        return () => talkback.delete(obs);
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
