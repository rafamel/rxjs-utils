import { Core, Push } from '../../definitions';
import { arbitrate } from '../../helpers';
import { Talkback } from '../Stream';

const $done = Symbol('done');
const $ptb = Symbol('ptb');
const $ctb = Symbol('ctb');

class Subscription<T = any, R = void> implements Push.Subscription {
  private [$done]: boolean;
  private [$ptb]: Core.Talkback<void, void> | void;
  private [$ctb]: Core.Talkback<T, R> | void;
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

    stream.source((ptb) => {
      this[$ptb] = ptb;
      return (this[$ctb] = new Talkback(() => observer, {
        closeOnError: true,
        afterTerminate: ptb.terminate.bind(ptb),
        onFail(err) {
          if (fail || ptb.closed) return ptb.error(err);
          if (!error) error = [err];
        }
      }));
    });
    // At this point we've just gotten the Subscriber
    // teardown function @ PushStream
    fail = true;
    const ptb = this[$ptb];
    if (error) {
      if (ptb) ptb.error(error[0]);
      else throw error[0];
    }
  }
  public get closed(): boolean {
    if (this[$done]) return true;
    const ctb = this[$ctb];
    return ctb ? ctb.closed : false;
  }
  public unsubscribe(): void {
    if (this.closed) return;

    this[$done] = true;
    const ptb = this[$ptb];
    if (ptb) ptb.terminate();
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
