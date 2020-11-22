import { Empty, Push } from '@definitions';
import { Talkback } from './assistance';
import { PushStream } from './PushStream';

export class ConnectableStream<T = any>
  extends PushStream<T>
  implements Push.Connectable<T> {
  #items: Set<Push.SubscriptionObserver<T>>;
  #stream: Push.Stream<T>;
  #talkback: Talkback<T>;
  #subscription: Empty | Push.Subscription;
  public constructor(stream: Push.Stream<T>) {
    super((obs) => {
      const talkback = this.#talkback;
      const items = this.#items;

      if (talkback.closed) {
        obs.error(Error(`Stream is already closed`));
        return null;
      } else {
        items.add(obs);
        talkback.add(obs);
        return () => {
          items.delete(obs);
          talkback.delete(obs);
        };
      }
    });

    this.#items = new Set();
    this.#stream = stream;
    this.#talkback = new Talkback<T>({ multicast: true });
  }
  public get size(): number {
    return this.#items.size;
  }
  public connect(): void {
    const subscription = this.#subscription;
    if (subscription) return;

    this.#subscription = this.#stream.subscribe(this.#talkback);
  }
  public disconnect(): void {
    const subscription = this.#subscription;
    if (!subscription) return;

    const items = this.#items;
    if (this.#talkback.closed) items.clear();

    subscription.unsubscribe();
    this.#subscription = null;

    const talkback = new Talkback<T>({ multicast: true });
    if (items.size) talkback.add(...items);
    this.#talkback = talkback;
  }
}
