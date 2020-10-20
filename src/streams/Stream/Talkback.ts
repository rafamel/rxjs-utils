import { Core, NoParamFn } from '../../definitions';
import { Action } from '../../helpers';
import { prepare } from './helpers/prepare';

const $transact = Symbol('transact');

export class Talkback<T, R = void> implements Core.Talkback<T, R> {
  private [$transact]: ReturnType<typeof prepare>;
  public constructor(
    hearback: Core.Hearback<T, R>,
    before?: NoParamFn,
    after?: NoParamFn
  ) {
    this[$transact] = prepare(hearback, before, after);
  }
  public next(value: T): void {
    return this[$transact](Action.Next, value);
  }
  public error(error: Error): void {
    return this[$transact](Action.Error, error);
  }
  public complete(reason: R): void {
    return this[$transact](Action.Complete, reason);
  }
  public terminate(): void {
    return this[$transact](Action.Terminate, undefined);
  }
}
