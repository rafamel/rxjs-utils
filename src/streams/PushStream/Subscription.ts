import { Core, Push } from '../../definitions';
import { arbitrate } from '../../helpers';
import { Talkback } from '../Stream';

const $done = Symbol('done');
const $talkback = Symbol('talkback');

class Subscription<T = any, R = void> implements Push.Subscription {
  private [$done]: boolean;
  private [$talkback]: Core.Talkback<void, void> | void;
  public constructor(stream: Push.Stream<T, R>, observer: Push.Observer<T, R>) {
    this[$done] = false;

    try {
      arbitrate(observer, 'start', this, null);
    } catch (error) {
      this[$done] = true;
      arbitrate(observer, 'error', error, () => {
        arbitrate(observer, 'terminate', undefined, null);
      });
    }

    if (this.closed) return;

    stream.source((talkback) => {
      this[$talkback] = talkback;
      return new Talkback(observer, {
        closeOnError: true,
        afterTerminate: () => talkback.terminate()
      });
    });
  }
  public get closed(): boolean {
    if (this[$done]) return true;

    const talkback = this[$talkback];
    return talkback ? talkback.closed : false;
  }
  public unsubscribe(): void {
    if (this.closed) return;

    this[$done] = true;
    const talkback = this[$talkback];
    if (talkback) talkback.terminate();
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
