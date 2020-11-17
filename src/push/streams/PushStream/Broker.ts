/* eslint-disable promise/param-names */
import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler } from '@helpers';
import { Subscription } from '../Observable';
import { terminateToAsyncFunction } from './helpers';

const $resolve = Symbol('resolve');
const $promise = Symbol('promise');

class Broker<T = any> extends Subscription<T> implements Push.Broker {
  private [$resolve]: NoParamFn | void;
  private [$promise]: Promise<void>;
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

    this[$promise] = promise;
    this[$resolve] = () => resolve();

    if (earlyFail || this.closed) this.unsubscribe();
    ready = true;
  }
  public get [Symbol.toStringTag](): string {
    return 'Broker';
  }
  public unsubscribe(): void {
    super.unsubscribe();

    const resolve = this[$resolve];
    if (resolve) resolve();
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
    return this.then(null, onReject);
  }
  public finally(
    onFinally?: Empty | NoParamFn<void | Promise<void>>
  ): Promise<void> {
    if (!onFinally) return this.then();

    return this.then(
      async (value) => {
        await onFinally();
        return value;
      },
      async (err) => {
        await onFinally();
        throw err;
      }
    );
  }
}

Broker.prototype.constructor = Object;

export { Broker };
