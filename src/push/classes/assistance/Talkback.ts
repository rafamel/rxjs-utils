import { Push } from '@definitions';
import { Invoke } from '../helpers';
import { UnaryFn, TypeGuard } from 'type-core';

export interface TalkbackOptions {
  multicast?: boolean;
  onError?: UnaryFn<Error>;
}

export class Talkback<T = any> implements Push.Talkback<T> {
  #items: Array<Push.Observer<T>>;
  #options: TalkbackOptions;
  public constructor(
    item: Push.Observer<T> | Array<Push.Observer<T>>,
    options?: TalkbackOptions
  ) {
    this.#items = TypeGuard.isArray(item) ? item : [item];
    this.#options = options || {};
  }
  public start(subscription: Push.Subscription): void {
    Invoke.observers('start', subscription, this.#items, this.#options);
  }
  public next(value: T): void {
    return Invoke.observers('next', value, this.#items, this.#options);
  }
  public error(error: Error): void {
    return Invoke.observers('error', error, this.#items, this.#options);
  }
  public complete(): void {
    return Invoke.observers('complete', undefined, this.#items, this.#options);
  }
}
