import { Empty, Push } from '@definitions';
import { Talkback } from './assistance';
import { PushStream } from './PushStream';

export interface PushableOptions {
  replay?: boolean | number;
}

export class PushableStream<T = any>
  extends PushStream<T>
  implements Push.Pushable<T> {
  #value: T | void;
  #values: T[];
  #termination: boolean | [Error];
  #talkback: Talkback<T>;
  public constructor(options?: PushableOptions | Empty) {
    super((obs) => {
      if (this.#termination) {
        typeof this.#termination === 'boolean'
          ? obs.complete()
          : obs.error(this.#termination[0]);
      } else {
        for (const value of this.#values) {
          obs.next(value);
        }
        this.#talkback.add(obs);
        return () => this.#talkback.delete(obs);
      }
    });

    const opts = options || {};
    const values: T[] = [];
    const talkback = new Talkback<T>({ multicast: true });

    if (opts.replay) {
      const n = Number(opts.replay);
      talkback.add({
        next: (value) => {
          values.push(value);
          if (values.length > n) values.shift();
        }
      });
    }

    this.#values = values;
    this.#termination = false;
    this.#talkback = talkback;
  }
  public get value(): T | void {
    return this.#value;
  }
  public get closed(): boolean {
    return Boolean(this.#termination);
  }
  public next(value: T): void {
    if (this.closed) return;
    this.#value = value;
    return this.#talkback.next(value);
  }
  public error(error: Error): void {
    if (this.closed) return;

    this.#termination = [error];
    return this.#talkback.error(error);
  }
  public complete(): void {
    if (this.closed) return;

    this.#termination = true;
    return this.#talkback.complete();
  }
}
