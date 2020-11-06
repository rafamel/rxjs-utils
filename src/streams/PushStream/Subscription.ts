import { Core, Push } from '../../definitions';
import { Talkback } from '../Stream';

const $closed = Symbol('closed');
const $ptb = Symbol('ptb');
const $ctb = Symbol('ctb');

const noop = (): void => undefined;

class Subscription<T = any> implements Push.Subscription {
  private [$closed]: boolean;
  private [$ptb]: Core.Talkback<void> | void;
  private [$ctb]: Core.Talkback<T> | void;
  public constructor(stream: Push.Stream<T>, observer: Push.Observer<T>) {
    this[$closed] = false;

    try {
      (observer as any).start(this);
    } catch (_) {}

    if (this.closed) return;

    stream.source((ptb) => {
      this[$ptb] = ptb;
      return (this[$ctb] = new Talkback(() => observer, {
        closeOnError: true,
        afterTerminate: ptb.terminate.bind(ptb),
        onFail: noop
      }));
    });
    // At this point we've just gotten the Subscriber
    // teardown function @ PushStream
  }
  public get closed(): boolean {
    if (this[$closed]) return true;
    const ctb = this[$ctb];
    return ctb ? ctb.closed : false;
  }
  public unsubscribe(): void {
    if (this.closed) return;

    this[$closed] = true;

    try {
      const ptb = this[$ptb];
      if (ptb) ptb.terminate();
    } catch (_) {}
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
