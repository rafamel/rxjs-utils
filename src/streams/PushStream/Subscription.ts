import { Core, NoParamFn, Push, UnaryFn } from '../../definitions';
import { catches, Promiser } from '../../helpers';
import { Talkback } from '../Stream';

const $fail = Symbol('fail');
const $closed = Symbol('closed');
const $promiser = Symbol('promiser');
const $ptb = Symbol('ptb');
const $ctb = Symbol('ctb');

class Subscription<T = any> implements Push.Subscription, Promise<void> {
  private [$fail]: boolean;
  private [$closed]: boolean;
  private [$promiser]: Promiser;
  private [$ptb]: Core.Talkback<void> | void;
  private [$ctb]: Core.Talkback<T> | void;
  public constructor(stream: Push.Stream<T>, observer: Push.Observer<T>) {
    this[$fail] = false;
    this[$closed] = false;
    const promiser = (this[$promiser] = new Promiser());

    try {
      (observer as any).start(this);
    } catch (err) {
      promiser.reject(err);
    }

    if (this.closed) return;

    stream.source((ptb) => {
      this[$ptb] = ptb;
      return (this[$ctb] = new Talkback(() => observer, {
        closeOnError: true,
        afterTerminate: () => {
          try {
            ptb.terminate();
          } catch (err) {
            return promiser.reject(err);
          }
          promiser.resolve();
        },
        onFail: (err) => {
          if (this[$fail]) catches(() => ptb.terminate());
          promiser.reject(err);
        }
      }));
    });
    // At this point we've just gotten the Subscriber
    // teardown function @ PushStream
  }
  get [Symbol.toStringTag](): string {
    return 'Subscription';
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
    } catch (err) {
      this[$promiser].reject(err);
    }
  }
  public async then<T = void, U = never>(
    resolution?: UnaryFn<void, T | PromiseLike<T>> | null,
    rejection?: UnaryFn<Error, U | PromiseLike<U>> | null
  ): Promise<T | U> {
    const { done, promise } = this[$promiser];

    this[$fail] = true;
    if (done) this.unsubscribe();

    return promise.then(resolution, rejection);
  }
  public async catch<T = never>(
    rejection?: UnaryFn<Error, T | PromiseLike<T>> | null
  ): Promise<void | T> {
    return this.then(undefined, rejection);
  }
  public async finally(
    finalization?: NoParamFn<void | PromiseLike<void>> | null
  ): Promise<void> {
    if (!finalization) return this.then();

    return this.then(
      async (value) => {
        await finalization();
        return value;
      },
      async (err) => {
        await finalization();
        throw err;
      }
    );
  }
}

Subscription.prototype.constructor = Object;

export { Subscription };
