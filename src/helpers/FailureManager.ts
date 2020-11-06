import { Empty, UnaryFn } from '../definitions';
import { Handler } from './Handler';

export class FailureManager {
  private fn: UnaryFn<Error> | Empty;
  private error: [Error] | Empty;
  public constructor(onFail?: UnaryFn<Error>) {
    this.fn = onFail || Handler.throws;
  }
  public get replete(): boolean {
    return Boolean(this.error);
  }
  public fail(error: Error, raise?: boolean): void {
    if (!this.fn) return;

    try {
      this.fn(error);
    } catch (err) {
      if (raise) {
        this.fn = null;
        throw err;
      } else {
        this.error = [err];
      }
    }
    this.fn = null;
  }
  public raise(): void {
    if (!this.error) return;

    const error = this.error[0];
    this.error = null;
    throw error;
  }
}
