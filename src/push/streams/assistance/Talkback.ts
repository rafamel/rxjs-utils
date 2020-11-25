import { Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Invoke } from '../helpers';

export interface TalkbackOptions {
  multicast?: boolean;
  onError?: UnaryFn<Error>;
}

export class Talkback<T = any> implements Push.Talkback<T> {
  #items: Array<Push.Hearback<T>>;
  #options: TalkbackOptions;
  public constructor(
    item: Push.Hearback<T> | Array<Push.Hearback<T>>,
    options?: TalkbackOptions
  ) {
    this.#items = TypeGuard.isArray(item) ? item : [item];
    this.#options = options || {};
  }
  public start(subscription: Push.Subscription): void {
    Invoke.hearbacks('start', subscription, this.#items, this.#options);
  }
  public next(value: T): void {
    return Invoke.hearbacks('next', value, this.#items, this.#options);
  }
  public error(error: Error): void {
    return Invoke.hearbacks('error', error, this.#items, this.#options);
  }
  public complete(): void {
    return Invoke.hearbacks('complete', undefined, this.#items, this.#options);
  }
  public terminate(): void {
    return Invoke.hearbacks('terminate', undefined, this.#items, this.#options);
  }
}
