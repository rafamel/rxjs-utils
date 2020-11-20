/* eslint-disable promise/param-names */
import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, ResultManager, TypeGuard } from '@helpers';
import { Subscription } from '../../observable';
import { ManagePromise, terminateToAsyncFunction } from '../helpers';

const $manager = Symbol('manager');
const $hearback = Symbol('terminate');

// TODO: rename
class Broker<T = any> extends Subscription<T> implements Push.Broker {
  private [$manager]: ResultManager;
  private [$hearback]: Empty | Push.Hearback<T>;
  public constructor(hearback: Push.Hearback<T>, producer: Push.Producer<T>) {
    let ready = false;

    const manager = new ResultManager();

    super(
      hearback as Push.Observer<T>,
      (obs) => {
        if (manager.replete) return;

        const fn = terminateToAsyncFunction(producer(obs));
        return () => {
          const pass = manager.pass.bind(manager);
          manager.pass = Handler.noop;
          fn().then(pass, manager.fail.bind(manager));
        };
      },
      (err: Error) => {
        manager.fail(err);
        if (ready) Handler.tries(this.unsubscribe.bind(this));
      }
    );

    const actions = ManagePromise.getActions(this);
    manager.onPass(actions[0]);
    manager.onFail(actions[1]);

    this[$manager] = manager;
    this[$hearback] = hearback;

    if (manager.replete || this.closed) this.unsubscribe();

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

    try {
      const method: any = hearback.terminate;
      if (!TypeGuard.isEmpty(method)) method.call(hearback);
    } catch (err) {
      this[$manager].fail(err);
    } finally {
      this[$manager].pass();
    }
  }
  public then<U = void, V = never>(
    onResolve?: Empty | UnaryFn<void, U | PromiseLike<U>>,
    onReject?: Empty | UnaryFn<Error, V | PromiseLike<V>>
  ): Promise<U | V> {
    return ManagePromise.getPromise(this).then(
      onResolve || null,
      onReject || null
    );
  }
  public catch<U = never>(
    onReject?: Empty | UnaryFn<Error, U | PromiseLike<U>>
  ): Promise<void | U> {
    return ManagePromise.getPromise(this).catch(onReject || null);
  }
  public finally(
    onFinally?: Empty | NoParamFn<void | Promise<void>>
  ): Promise<void> {
    return ManagePromise.getPromise(this).finally(onFinally || null);
  }
}

Broker.prototype.constructor = Object;

export { Broker };
