import { Core, NoParamFn } from '../../definitions';
import { arbitrate, capture, invoke, silence } from '../../helpers';

const $closed = Symbol('closed');
const $terminated = Symbol('terminated');
const $hearback = Symbol('hearback');
const $beforeOpen = Symbol('beforeOpen');
const $afterTerminate = Symbol('afterTerminate');

export class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$closed]: boolean;
  private [$terminated]: boolean;
  private [$hearback]: Core.Hearback<T, R>;
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
    // Replicate `arbitrate` for next (performance)
    try {
      const hearback = this[$hearback];
      const method: any = hearback.next;
      try {
        return method.call(hearback, value);
      } catch (err) {
        capture('next', method, err, null);
      }
    } catch (err) {
      silence(() => this.terminate());
      throw err;
    }
  }
  public error(error: Error): void {
    if (this[$closed]) throw error;

    invoke(this[$beforeOpen]);
    // Replicate `arbitrate` for error (performance)
    try {
      const hearback = this[$hearback];
      const method: any = hearback.error;
      try {
        return method.call(hearback, error);
      } catch (err) {
        capture('error', method, err, null);
      }
    } catch (err) {
      silence(() => this.terminate());
      throw err;
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
