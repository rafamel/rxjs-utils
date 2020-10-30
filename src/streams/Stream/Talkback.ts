import { Core, NoParamFn, WideRecord } from '../../definitions';
import { arbitrate, capture, invoke } from '../../helpers';

const $closed = Symbol('closed');
const $terminated = Symbol('terminated');
const $hearback = Symbol('hearback');
const $options = Symbol('options');
const $beforeOpen = Symbol('beforeOpen');

export interface TalkbackOptions {
  beforeOpen?: NoParamFn;
  afterTerminate?: NoParamFn;
}

class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$closed]: boolean;
  private [$terminated]: boolean;
  private [$hearback]: WideRecord;
  private [$options]: TalkbackOptions;
  private [$beforeOpen]: null | NoParamFn;
  public constructor(hearback: Core.Hearback<T, R>, options?: TalkbackOptions) {
    this[$closed] = false;
    this[$terminated] = false;
    this[$hearback] = hearback;
    this[$options] = options || {};

    const beforeOpen =
      options && options.beforeOpen ? options.beforeOpen.bind(options) : null;
    this[$beforeOpen] = beforeOpen
      ? () => (this[$beforeOpen] = null) || beforeOpen()
      : null;
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public next(value: T): void {
    if (this.closed) return;

    invoke(this[$beforeOpen]);
    try {
      return this[$hearback].next(value);
    } catch (err) {
      capture(this[$hearback], 'next', err, null, null, () => {
        this.terminate();
      });
    }
  }
  public error(error: Error): void {
    if (this.closed) throw error;

    invoke(this[$beforeOpen]);
    try {
      return this[$hearback].error(error);
    } catch (err) {
      capture(this[$hearback], 'error', err, [error], null, () => {
        this.terminate();
      });
    }
  }
  public complete(reason: R): void {
    if (this.closed) return;

    this[$closed] = true;

    invoke(this[$beforeOpen]);
    return arbitrate(this[$hearback], 'complete', reason, () => {
      this.terminate();
    });
  }
  public terminate(): void {
    if (this[$terminated]) return;

    this[$closed] = true;
    this[$terminated] = true;

    invoke(this[$beforeOpen]);
    return arbitrate(this[$hearback], 'terminate', undefined, () => {
      const options = this[$options];
      if (options.afterTerminate) options.afterTerminate();
    });
  }
}

Talkback.prototype.constructor = Object;

export { Talkback };
