import { Core, NoParamFn, UnaryFn, WideRecord } from '../../definitions';
import { FailureManager, IdentityGuard, Handler } from '../../helpers';

export interface TalkbackOptions {
  onFail?: UnaryFn<Error>;
  closeOnError?: boolean;
  afterTerminate?: NoParamFn;
}

const $start = Symbol('start');
const $closed = Symbol('closed');
const $terminable = Symbol('terminable');
const $hearback = Symbol('hearback');
const $failure = Symbol('failure');
const $options = Symbol('options');

class Talkback<T> implements Core.Talkback<T> {
  private [$start]: NoParamFn<WideRecord>;
  private [$closed]: boolean;
  private [$terminable]: boolean;
  private [$hearback]: void | WideRecord;
  private [$failure]: FailureManager;
  private [$options]: TalkbackOptions;
  public constructor(
    hearback: NoParamFn<Core.Hearback<T>>,
    options?: TalkbackOptions
  ) {
    if (!options) options = {};

    this[$start] = () => (this[$hearback] = hearback());
    this[$closed] = false;
    this[$terminable] = true;
    this[$failure] = new FailureManager(options.onFail || Handler.throws);
    this[$options] = options;
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public next(value: T): void {
    if (this.closed) return;

    let method: any = Handler.noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.next).call(hearback, value);
    } catch (err) {
      if (IdentityGuard.isEmpty(method)) return;
      this[$failure].fail(err, true);
    }
  }
  public error(error: Error): void {
    if (this.closed) return this[$failure].fail(error, true);

    const options = this[$options];
    if (options.closeOnError) {
      this[$closed] = true;
      this[$terminable] = false;
    }

    const failure = this[$failure];
    let method: any = Handler.noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.error).call(hearback, error);
    } catch (err) {
      if (IdentityGuard.isEmpty(method)) failure.fail(error);
      else failure.fail(err);
    }

    if (failure.replete || options.closeOnError) {
      this[$terminable] = true;
      this.terminate();
    } else {
      failure.raise();
    }
  }
  public complete(): void {
    if (this.closed) return;

    this[$closed] = true;
    this[$terminable] = false;

    const failure = this[$failure];
    let method: any = Handler.noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.complete).call(hearback);
    } catch (err) {
      if (!IdentityGuard.isEmpty(method)) failure.fail(err);
    }

    this[$terminable] = true;
    this.terminate();
  }
  public terminate(): void {
    if (!this[$terminable]) return;

    this[$closed] = true;
    this[$terminable] = false;

    let method: any = Handler.noop;
    const failure = this[$failure];
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.terminate).call(hearback);
    } catch (err) {
      if (!IdentityGuard.isEmpty(method)) failure.fail(err);
    }

    const options = this[$options];
    try {
      if (options.afterTerminate) options.afterTerminate();
    } catch (err) {
      failure.fail(err);
    }

    failure.raise();
  }
}

Talkback.prototype.constructor = Object;

export { Talkback };
