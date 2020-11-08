import { Core, Push } from '../../definitions';

const $talkback = Symbol('talkback');

class ObserverTalkback<T> implements Push.ObserverTalkback<T> {
  private [$talkback]: Core.Talkback<T>;
  public constructor(talkback: Core.Talkback<T>) {
    this[$talkback] = talkback;
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
}

ObserverTalkback.prototype.constructor = Object;

export { ObserverTalkback };
