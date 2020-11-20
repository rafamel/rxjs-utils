import { Push } from '@definitions';
import { PushStream } from './PushStream';

const $closed = Symbol('closed');
const $talkbacks = Symbol('talkbacks');

export class PushableStream<T = any> extends PushStream<T>
  implements Push.Pushable<T> {
  private [$closed]: boolean;
  private [$talkbacks]: Set<Push.Talkback<T>>;
  public constructor() {
    const talkbacks = new Set<Push.Talkback<T>>();
    super((tb) => {
      if (this.closed) {
        tb.error(Error(`Stream is already closed`));
        return null;
      } else {
        talkbacks.add(tb);
        return () => talkbacks.delete(tb);
      }
    });
    this[$closed] = false;
    this[$talkbacks] = talkbacks;
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public next(value: T): void {
    for (const talkback of this[$talkbacks]) {
      talkback.next(value);
    }
  }
  public error(error: Error): void {
    this[$closed] = true;
    for (const talkback of this[$talkbacks]) {
      talkback.error(error);
    }
    this[$talkbacks].clear();
  }
  public complete(): void {
    this[$closed] = true;
    for (const talkback of this[$talkbacks]) {
      talkback.complete();
    }
    this[$talkbacks].clear();
  }
}
