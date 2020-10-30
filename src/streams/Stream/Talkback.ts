import { Core, NoParamFn, WideRecord } from '../../definitions';
import { arbitrate, capture, invoke } from '../../helpers';

const $closed = Symbol('closed');
const $terminated = Symbol('terminated');
const $hearback = Symbol('hearback');
const $beforeOpen = Symbol('beforeOpen');
const $afterTerminate = Symbol('afterTerminate');

export class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$closed]: boolean;
  private [$terminated]: boolean;
  private [$hearback]: WideRecord;
  private [$beforeOpen]: null | NoParamFn;
  private [$afterTerminate]: null | NoParamFn;
  public constructor(
    hearback: Core.Hearback<T, R>,
    beforeOpen?: NoParamFn,
    afterTerminate?: NoParamFn
  ) {
    this[$closed] = false;
    this[$terminated] = false;
    this[$hearback] = hearback;
    this[$beforeOpen] = beforeOpen
      ? () => (this[$beforeOpen] = null) || beforeOpen()
      : null;
    this[$afterTerminate] = afterTerminate || null;
  }
  public next(value: T): void {
    if (this[$closed]) return;

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
    if (this[$closed]) throw error;

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
    if (this[$closed]) return;

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
      const afterTerminate = this[$afterTerminate];
      if (afterTerminate) afterTerminate();
    });
  }
}
