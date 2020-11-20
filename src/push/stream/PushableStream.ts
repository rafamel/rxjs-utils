import { Push } from '@definitions';
import { Router } from './assistance';
import { PushStream } from './PushStream';

const $router = Symbol('router');

export class PushableStream<T = any> extends PushStream<T>
  implements Push.Pushable<T> {
  private [$router]: Router<T>;
  public constructor() {
    const router = new Router<T>({ multicast: true });
    super((tb) => {
      if (this.closed) {
        tb.error(Error(`Stream is already closed`));
        return null;
      } else {
        router.add(tb);
        return () => router.delete(tb);
      }
    });
    this[$router] = router;
  }
  public get closed(): boolean {
    return this[$router].closed;
  }
  public next(value: T): void {
    return this[$router].next(value);
  }
  public error(error: Error): void {
    return this[$router].error(error);
  }
  public complete(): void {
    return this[$router].complete();
  }
}
