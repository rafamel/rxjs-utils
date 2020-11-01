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
      arbitrate(observer, 'start', this, null, null);
    } catch (error) {
      this[$done] = true;
      arbitrate(observer, 'error', error, null, () => {
        arbitrate(observer, 'terminate', undefined, null, null);
      });
    }

    if (this.closed) return;

    let fail = false;
    let error: undefined | [Error];

    stream.source((talkback) => {
      this[$talkback] = talkback;
      return new Talkback(() => observer, {
        closeOnError: true,
        afterTerminate: talkback.terminate.bind(talkback),
        onFail(err) {
          if (fail || talkback.closed) return talkback.error(err);
          if (!error) error = [err];
        }
      });
    });

    // At this point we've just gotten the Subscriber
    // teardown function @ PushStream
    fail = true;
    const talkback = this[$talkback];
    if (error) {
      if (talkback) talkback.error(error[0]);
      else throw error[0];
    }
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
