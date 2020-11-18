import { Empty, Push } from '@definitions';
import { TypeGuard } from '@helpers';

const $talkback = Symbol('talkback');
const $hearback = Symbol('hearback');
const $duplicate = Symbol('duplicate');

export class Forwarder<T, U = T> implements Required<Push.Hearback<U>> {
  private [$talkback]: Push.Talkback<T>;
  private [$hearback]: Push.Hearback<U>;
  private [$duplicate]: boolean;
  public constructor(
    talkback: Push.Talkback<T>,
    hearback?: Push.Hearback<U> | Empty,
    duplicate?: boolean | Empty
  ) {
    this[$talkback] = talkback;
    this[$hearback] = hearback || {};
    this[$duplicate] = Boolean(duplicate);
  }
  public start(broker: Push.Broker): void {
    const hearback = this[$hearback];

    try {
      const method = hearback.start;
      if (!TypeGuard.isEmpty(method)) method.call(hearback, broker);
    } catch (err) {
      const talkback = this[$talkback];
      if (talkback.closed) throw err;
      else talkback.error(err);
    }
  }
  public next(value: U): void {
    const hearback = this[$hearback];
    if (!hearback) return this[$talkback].next(value as any);

    try {
      const method = hearback.next;
      if (!TypeGuard.isEmpty(method)) method.call(hearback, value);
      if (this[$duplicate]) this[$talkback].next(value as any);
    } catch (err) {
      const talkback = this[$talkback];
      if (talkback.closed) throw err;
      else talkback.error(err);
    }
  }
  public error(error: Error): void {
    const hearback = this[$hearback];
    if (!hearback) return this[$talkback].error(error);

    try {
      const method = hearback.error;
      if (!TypeGuard.isEmpty(method)) method.call(hearback, error);
      if (this[$duplicate]) this[$talkback].error(error);
    } catch (err) {
      const talkback = this[$talkback];
      if (talkback.closed) throw err;
      else talkback.error(err);
    }
  }
  public complete(): void {
    const hearback = this[$hearback];
    if (!hearback) return this[$talkback].complete();

    try {
      const method = hearback.complete;
      if (!TypeGuard.isEmpty(method)) method.call(hearback);
      if (this[$duplicate]) this[$talkback].complete();
    } catch (err) {
      const talkback = this[$talkback];
      if (talkback.closed) throw err;
      else talkback.error(err);
    }
  }
  public terminate(): void {
    const hearback = this[$hearback];

    try {
      const method = hearback.terminate;
      if (!TypeGuard.isEmpty(method)) method.call(hearback);
    } catch (err) {
      const talkback = this[$talkback];
      if (talkback.closed) throw err;
      else talkback.error(err);
    }
  }
}
