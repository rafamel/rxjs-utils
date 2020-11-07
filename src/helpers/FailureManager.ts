import { Empty, UnaryFn } from '../definitions';

export class FailureManager {
  private fn: UnaryFn<Error> | Empty;
  private error: [Error] | Empty;
  public constructor(onFail: UnaryFn<Error>) {
    this.fn = onFail;
  }
  public get replete(): boolean {
    return Boolean(this.error);
  }
  public fail(error: Error, raise?: boolean): void {
    if (!this.fn) return raise ? this.raise() : undefined;

    try {
      this.fn(error);
    } catch (err) {
      this.error = [err];
      if (raise) {
        this.fn = null;
        throw err;
      }
    }
    this.fn = null;
  }
  public raise(): void {
    if (!this.error) return;
    throw this.error[0];
  }
}
