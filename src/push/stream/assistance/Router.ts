import { Empty, Intersection, Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';

const $empty = Symbol('empty');
const $items = Symbol('items');
const $options = Symbol('options');
const $closed = Symbol('closed');
const $terminated = Symbol('terminated');

export interface RouterOptions {
  report?: UnaryFn<Error>;
  multicast?: boolean;
}

export class Router<T>
  implements Intersection<Push.Hearback<T>, Push.Talkback<T>> {
  private [$items]: Set<Push.Hearback<T>>;
  private [$options]: RouterOptions;
  private [$closed]: boolean;
  private [$terminated]: boolean;
  public constructor(
    options?: RouterOptions | Empty,
    ...items: Array<Push.Hearback<T>>
  ) {
    this[$items] = new Set<Push.Hearback<T>>();
    this[$options] = options || {};
    this[$closed] = false;
    this[$terminated] = false;

    if (items.length) this.add(...items);
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public add(...items: Array<Push.Hearback<T>>): void {
    const set = this[$items];
    if (!set) return;

    for (const item of items) {
      if (!set.has(item)) set.add(item);
    }
  }
  public delete(...items: Array<Push.Hearback<T>>): void {
    const set = this[$items];
    if (!set) return;

    for (const item of items) {
      set.delete(item);
    }
  }
  public start(broker: Push.Broker): void {
    return this.closed
      ? undefined
      : invoke('start', broker, this[$items], this[$options]);
  }
  public next(value: T): void {
    if (this.closed) return;

    // Does not use invoke to increase performance
    const items = this[$items];
    const options = this[$options];

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
    if (this.closed) return;
    this[$closed] = true;
    return invoke('error', error, this[$items], this[$options]);
  }
  public complete(): void {
    if (this.closed) return;
    this[$closed] = true;
    return invoke('complete', undefined, this[$items], this[$options]);
  }
  public terminate(): void {
    if (this[$terminated]) return;
    this[$closed] = true;
    this[$terminated] = true;
    return invoke('terminate', undefined, this[$items], this[$options]);
  }
}

function invoke(
  action: keyof Push.Hearback,
  payload: any,
  items: Set<Push.Hearback>,
  options: RouterOptions
): void {
  for (const item of items) {
    try {
      const method: any = item[action];
      if (TypeGuard.isEmpty(method)) continue;
      else method.call(item, payload);
    } catch (err) {
      if (options.report) options.report(err);
    }
    if (!options.multicast) break;
  }
}
