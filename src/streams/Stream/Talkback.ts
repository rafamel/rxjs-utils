import { Core, NoParamFn, UnaryFn, WideRecord } from '../../definitions';
import { isEmpty } from '../../helpers';

export interface TalkbackOptions {
  onFail?: UnaryFn<Error>;
  closeOnError?: boolean;
  afterTerminate?: NoParamFn;
}

function noop(): void {
  return undefined;
}
function throws(error: Error): never {
  throw error;
}

const $start = Symbol('start');
const $closed = Symbol('closed');
const $terminable = Symbol('terminable');
const $hearback = Symbol('hearback');
const $options = Symbol('options');

class Talkback<T> implements Core.Talkback<T> {
  private [$start]: NoParamFn<WideRecord>;
  private [$closed]: boolean;
  private [$terminable]: boolean;
  private [$hearback]: void | WideRecord;
  private [$options]: Required<TalkbackOptions>;
  public constructor(
    hearback: NoParamFn<Core.Hearback<T>>,
    options?: TalkbackOptions
  ) {
    if (!options) options = {};

    this[$start] = () => (this[$hearback] = hearback());
    this[$closed] = false;
    this[$terminable] = true;
    this[$options] = {
      onFail: options.onFail || throws,
      closeOnError: options.closeOnError || false,
      afterTerminate: options.afterTerminate || noop
    };
  }
  public get closed(): boolean {
    return this[$closed];
  }
  public next(value: T): void {
    if (this.closed) return;

    let method: any = noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.next).call(hearback, value);
    } catch (err) {
      if (isEmpty(method)) return;
      this[$options].onFail(err);
    }
  }
  public error(error: Error): void {
    if (this.closed) {
      this[$options].onFail(error);
      return;
    }

    const options = this[$options];
    if (options.closeOnError) {
      this[$closed] = true;
      this[$terminable] = false;
    }

    let err: void | [Error];
    let method: any = noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.error).call(hearback, error);
    } catch (e) {
      if (isEmpty(method)) err = [error];
      else err = [e];
    }

    if (err || options.closeOnError) {
      this[$terminable] = true;
      try {
        this.terminate();
      } catch (e) {
        if (!err) err = [e];
      }
    }

    if (err) options.onFail(err[0]);
  }
  public complete(): void {
    if (this.closed) return;

    this[$closed] = true;
    this[$terminable] = false;

    let err: void | [Error];
    let method: any = noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.complete).call(hearback);
    } catch (e) {
      if (!isEmpty(method)) err = [e];
    }

    this[$terminable] = true;
    try {
      this.terminate();
    } catch (e) {
      if (!err) err = [e];
    }

    if (err) this[$options].onFail(err[0]);
  }
  public terminate(): void {
    if (!this[$terminable]) return;

    this[$closed] = true;
    this[$terminable] = false;

    let err: void | [Error];
    let method: any = noop;
    try {
      const hearback = this[$hearback] || this[$start]();
      (method = hearback.terminate).call(hearback);
    } catch (e) {
      if (!isEmpty(method)) err = [e];
    }

    const options = this[$options];
    try {
      options.afterTerminate();
    } catch (e) {
      err = [e];
    }

    if (err) options.onFail(err[0]);
  }
}

Talkback.prototype.constructor = Object;

export { Talkback };
