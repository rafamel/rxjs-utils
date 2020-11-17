/* eslint-disable promise/param-names */
import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { Subscription } from '../Observable';
import { terminateToAsyncFunction } from './helpers';

const $hearback = Symbol('terminate');
const $promise = Symbol('promise');
const $resolve = Symbol('resolve');
const $reject = Symbol('reject');

class Broker<T = any> extends Subscription<T> implements Push.Broker {
  private [$hearback]: Empty | Push.Hearback<T>;
  private [$promise]: Promise<void>;
  private [$resolve]: NoParamFn;
  private [$reject]: UnaryFn<Error>;
  public constructor(hearback: Push.Hearback<T>, producer: Push.Producer<T>) {
    let ready = false;
    let earlyFail = false;

    let resolve: any;
    let reject: any;
    const promise = new Promise<void>((a, b) => {
      resolve = a;
      reject = b;
    });

    super(
      hearback,
      (obs) => {
        if (earlyFail) return;

        const fn = terminateToAsyncFunction(producer(obs));
        return () => {
          const a = resolve;
          resolve = Handler.noop;
          fn().then(a, reject);
        };
      },
      (err: Error) => {
        reject(err);
        if (ready) Handler.tries(this.unsubscribe.bind(this));
        else earlyFail = true;
      }
    );

    this[$hearback] = hearback;
    this[$promise] = promise;
    this[$resolve] = () => resolve();
    this[$reject] = reject;

    if (earlyFail || this.closed) this.unsubscribe();
    ready = true;
  }
  public get [Symbol.toStringTag](): string {
    return 'Broker';
  }
  public unsubscribe(): void {
    super.unsubscribe();

    const hearback = this[$hearback];
    if (!hearback) return;

    this[$hearback] = null;
    Handler.tries(
      () => {
        const method: any = hearback.terminate;
        if (!TypeGuard.isEmpty(method)) method.call(hearback);
      },
      this[$reject],
      this[$resolve]
    );
  }
  public then<U = void, V = never>(
    onResolve?: Empty | UnaryFn<void, U | PromiseLike<U>>,
    onReject?: Empty | UnaryFn<Error, V | PromiseLike<V>>
  ): Promise<U | V> {
    return this[$promise].then(onResolve || null, onReject || null);
  }
  public catch<U = never>(
    onReject?: Empty | UnaryFn<Error, U | PromiseLike<U>>
  ): Promise<void | U> {
    return this[$promise].catch(onReject || null);
  }
  public finally(
    onFinally?: Empty | NoParamFn<void | Promise<void>>
  ): Promise<void> {
    return this[$promise].finally(onFinally || null);
  }
}

Broker.prototype.constructor = Object;

export { Broker };
