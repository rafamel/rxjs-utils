import { Core, NoParamFn, WideRecord } from '../../definitions';
import { arbitrate, capture } from '../../helpers';

const $closed = Symbol('closed');
const $terminated = Symbol('terminated');
const $hearback = Symbol('hearback');
const $options = Symbol('options');
const $open = Symbol('open');

export interface TalkbackOptions {
  afterTerminate?: NoParamFn;
  closeOnError?: boolean;
}

class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$closed]: boolean;
  private [$terminated]: boolean;
  private [$hearback]: WideRecord | void;
  private [$options]: TalkbackOptions;
  private [$open]: NoParamFn<Core.Hearback<T, R>>;
  public constructor(
    fn: NoParamFn<Core.Hearback<T, R>>,
    options?: TalkbackOptions
  ) {
    this[$closed] = false;
    this[$terminated] = false;
    this[$options] = options || {};
    this[$open] = () => (this[$hearback] = fn());
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public next(value: T): void {
    if (this.closed) return;

    const hearback = this[$hearback] || this[$open]();

    let method: any;
    try {
      return (method = hearback.next).call(hearback, value);
    } catch (err) {
      capture(method, 'next', err, null, this.terminate.bind(this));
    }
  }
  public error(error: Error): void {
    if (this.closed) throw error;

    const options = this[$options];
    const hearback = this[$hearback] || this[$open]();

    if (options && options.closeOnError) {
      this[$closed] = true;
      return arbitrate(hearback, 'error', error, this.terminate.bind(this));
    }

    let method: any;
    try {
      return (method = hearback.error).call(hearback, error);
    } catch (err) {
      capture(method, 'error', err, [error], this.terminate.bind(this));
    }
  }
  public complete(reason: R): void {
    if (this.closed) return;

    this[$closed] = true;

    return arbitrate(
      this[$hearback] || this[$open](),
      'complete',
      reason,
      this.terminate.bind(this)
    );
  }
  public terminate(): void {
    if (this[$terminated]) return;

    this[$closed] = true;
    this[$terminated] = true;

    return arbitrate(
      this[$hearback] || this[$open](),
      'terminate',
      undefined,
      () => {
        const options = this[$options];
        if (options.afterTerminate) options.afterTerminate();
      }
    );
  }
}

Talkback.prototype.constructor = Object;

export { Talkback };
