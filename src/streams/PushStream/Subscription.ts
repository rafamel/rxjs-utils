import { Core, NoParamFn, Push, UnaryFn } from '../../definitions';
import { IdentityGuard, Handler, ResultManager } from '../../helpers';
import { Talkback } from '../Stream';

const $fail = Symbol('fail');
const $closed = Symbol('closed');
const $result = Symbol('result');
const $promise = Symbol('promise');
const $ptb = Symbol('ptb');
const $ctb = Symbol('ctb');

class Subscription<T = any> implements Push.Subscription {
  private [$fail]: boolean;
  private [$closed]: boolean;
  private [$result]: ResultManager;
  private [$promise]: void | Promise<void>;
  private [$ptb]: Core.Talkback<void> | void;
  private [$ctb]: Core.Talkback<T> | void;
  public constructor(stream: Push.Stream<T>, observer: Push.Observer<T>) {
    this[$fail] = false;
    this[$closed] = false;
    const result = (this[$result] = new ResultManager());

    let method = Handler.noop;
    try {
      (method = (observer as any).start).call(observer, this);
    } catch (err) {
      if (!IdentityGuard.isEmpty(method)) {
        result.fail(err);
        if (this[$fail]) this.unsubscribe();
      }
    }

    if (this.closed) return;

    let pass = false;
    let suspend = true;
    stream.source((ptb) => {
      this[$ptb] = ptb;
      return (this[$ctb] = new Talkback(() => observer, {
        closeOnError: true,
        afterTerminate: () => {
          try {
            ptb.terminate();
          } catch (err) {
            return result.fail(err);
          }
          if (suspend) pass = true;
          else result.pass();
        },
        onFail: (err) => {
          result.fail(err);
          if (this[$fail]) ptb.terminate();
        }
      }));
    });
    // At this point we've just gotten the Subscriber
    // teardown function @ PushStream
    suspend = false;
    if (pass) result.pass();
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

    const result = this[$result];
    try {
      const ptb = this[$ptb];
      if (ptb) ptb.terminate();
    } catch (err) {
      return result.fail(err);
    }
    result.pass();
  }
  public async then<T = void, U = never>(
    resolution?: UnaryFn<void, T | PromiseLike<T>> | null,
    rejection?: UnaryFn<Error, U | PromiseLike<U>> | null
  ): Promise<T | U> {
    const promise = this[$promise];
    if (promise) return promise.then(resolution, rejection);

    this[$fail] = true;
    const result = this[$result];
    if (result.replete) this.unsubscribe();

    return (this[$promise] = new Promise((resolve, reject) => {
      result.onPass(resolve);
      result.onFail(reject);
    })).then(resolution, rejection);
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
