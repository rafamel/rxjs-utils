import { Pull } from '@definitions';
import { Handler, Resolver } from '@helpers';
import { Validate } from './helpers';
import { MaybePromise, Members, TypeGuard } from 'type-core';

export class PullableIterator<O, I> implements Pull.PullableIterator<O, I> {
  #closed: boolean;
  #iterator: Members;
  public constructor(iterator: Pull.PureIterator<O, I>) {
    Validate.counter(iterator);

    this.#closed = false;
    this.#iterator = iterator;
  }
  public next(value: I): MaybePromise<Pull.Response<O>> {
    if (this.#closed) return { complete: true };

    const iterator = this.#iterator;

    let method: any = Handler.noop;
    return Resolver.resolve<any>(
      () => (method = iterator.next).call(iterator, value),
      (result) => {
        if (TypeGuard.isObject(result)) return result;
        throw new TypeError('Expected result to be an object');
      },
      (err) => {
        if (TypeGuard.isEmpty(method)) return { complete: true };
        throw err;
      }
    );
  }
  public error(error: Error): MaybePromise<Pull.Response<O>> {
    if (this.#closed) return { complete: true };

    const iterator = this.#iterator;

    let method: any = Handler.noop;
    return Resolver.resolve<any>(
      () => (method = iterator.error).call(iterator, error),
      (result) => {
        if (TypeGuard.isObject(result)) return result;

        this.#closed = true;
        throw new TypeError('Expected result to be an object');
      },
      (err) => {
        this.#closed = true;
        if (TypeGuard.isEmpty(method)) throw error;
        else throw err;
      }
    );
  }
  public complete(): MaybePromise<void> {
    if (this.#closed) return;

    const iterator = this.#iterator;

    this.#closed = true;
    let method: any = Handler.noop;
    return Resolver.resolve<any>(
      () => (method = iterator.complete).call(iterator),
      null,
      (err) => {
        if (!TypeGuard.isEmpty(method)) throw err;
      }
    );
  }
}
