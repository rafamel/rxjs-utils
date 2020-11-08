import { Push } from '../definitions';
import { PushStream } from './PushStream';

const $talkback = Symbol('talkback');

export class PushableStream<T = any> extends PushStream<T>
  implements Push.Stream<T>, Push.Talkback<T> {
  private [$talkback]: Push.Talkback<T>;
  public constructor() {
    super((tb) => {
      this[$talkback] = tb;
    });
  }
  public get closed(): boolean {
    return this[$talkback].closed;
  }
  public next(value: T): void {
    this[$talkback].next(value);
  }
  public error(error: Error): void {
    this[$talkback].error(error);
  }
  public complete(): void {
    this[$talkback].complete();
  }
  public terminate(): void {
    this[$talkback].terminate();
  }
}
