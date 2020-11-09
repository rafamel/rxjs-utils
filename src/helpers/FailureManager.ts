import { Empty, UnaryFn } from '../definitions';

export class FailureManager {
  private fn: UnaryFn<Error>;
  private error: [Error] | Empty;
  public constructor(onFail: UnaryFn<Error>) {
    this.fn = onFail;
  }
  public get replete(): boolean {
    return Boolean(this.error);
  }
  public fail(error: Error, raise?: boolean): void {
    if (this.replete) {
      if (!raise) return;
      this.fn(error);
    } else {
      try {
        this.fn(error);
      } catch (err) {
        this.error = [err];
        if (raise) throw err;
      }
    }
  }
  public raise(): void {
    if (!this.error) return;
    throw this.error[0];
  }
}
