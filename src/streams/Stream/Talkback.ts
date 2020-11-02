import { Core, NoParamFn, UnaryFn, WideRecord } from '../../definitions';
import { arbitrate, capture } from '../../helpers';

const $closed = Symbol('closed');
const $terminable = Symbol('terminable');
const $hearback = Symbol('hearback');
const $options = Symbol('options');
const $open = Symbol('open');
const $onFail = Symbol('onFail');

export interface TalkbackOptions {
  afterTerminate?: NoParamFn;
  closeOnError?: boolean;
  onFail?: UnaryFn<Error>;
}

class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$closed]: boolean;
  private [$terminable]: boolean;
  private [$hearback]: WideRecord | void;
  private [$options]: TalkbackOptions;
  private [$open]: NoParamFn<Core.Hearback<T, R>>;
  private [$onFail]: UnaryFn<Error>;
  public constructor(
    fn: NoParamFn<Core.Hearback<T, R>>,
    options?: TalkbackOptions
  ) {
    this[$closed] = false;
    this[$terminable] = true;
    this[$options] = options || {};
    this[$open] = () => (this[$hearback] = fn());
    this[$onFail] =
      this[$options].onFail ||
      ((err) => {
        throw err;
      });
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
      capture(
        method,
        'next',
        err,
        null,
        this[$onFail],
        this.terminate.bind(this)
      );
    }
  }
  public error(error: Error): void {
    if (this.closed) return this[$onFail](error);

    const options = this[$options];
    const hearback = this[$hearback] || this[$open]();

    if (options && options.closeOnError) {
      this[$closed] = true;
      this[$terminable] = false;

      return arbitrate(
        hearback,
        'error',
        error,
        this[$onFail],
        () => (this[$terminable] = true) && this.terminate()
      );
    }

    let method: any;
    try {
      return (method = hearback.error).call(hearback, error);
    } catch (err) {
      capture(
        method,
        'error',
        err,
        [error],
        this[$onFail],
        this.terminate.bind(this)
      );
    }
  }
  public complete(reason: R): void {
    if (this.closed) return;

    this[$closed] = true;
    this[$terminable] = false;

    return arbitrate(
      this[$hearback] || this[$open](),
      'complete',
      reason,
      this[$onFail],
      () => (this[$terminable] = true) && this.terminate()
    );
  }
  public terminate(): void {
    if (!this[$terminable]) return;

    this[$closed] = true;
    this[$terminable] = false;

    return arbitrate(
      this[$hearback] || this[$open](),
      'terminate',
      undefined,
      this[$onFail],
      () => {
        const options = this[$options];
        if (options.afterTerminate) options.afterTerminate();
      }
    );
  }
}

Talkback.prototype.constructor = Object;

export { Talkback };
