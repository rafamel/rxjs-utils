import { Empty, Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { Invoke } from '../helpers';

const $empty = Symbol('empty');

export interface TalkbackOptions {
  report?: UnaryFn<Error>;
  multicast?: boolean;
}

export class Talkback<T = any> implements Push.Talkback<T> {
  #items: Set<Push.Hearback<T>>;
  #options: TalkbackOptions;
  public constructor(
    options?: TalkbackOptions | Empty,
    ...items: Array<Push.Hearback<T>>
  ) {
    this.#items = new Set<Push.Hearback<T>>();
    this.#options = options || {};

    if (items.length) this.add(...items);
  }
  public add(...items: Array<Push.Hearback<T>>): void {
    const itemsSet = this.#items;
    if (!itemsSet) return;

    for (const item of items) {
      if (!itemsSet.has(item)) itemsSet.add(item);
    }
  }
  public delete(...items: Array<Push.Hearback<T>>): void {
    const itemsSet = this.#items;

    for (const item of items) {
      itemsSet.delete(item);
    }
  }
  public start(subscription: Push.Subscription): void {
    Invoke.hearbacks('start', subscription, this.#items, this.#options);
  }
  public next(value: T): void {
    // Does not use invoke to improve performance
    const items = this.#items;
    const options = this.#options;

    for (const item of items) {
      let method: any = $empty;
      try {
        // Calls method preemptively, swallows error if empty
        method = item.next;
        method.call(item, value);
      } catch (err) {
        if (TypeGuard.isEmpty(method)) continue;
        else if (options.report) options.report(err);
      }
      if (!options.multicast) break;
    }
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
