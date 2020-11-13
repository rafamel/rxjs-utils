import { Empty, UnaryFn } from '@definitions';

export class FailureManager {
  private fn: UnaryFn<Error>;
  private disabled: boolean;
  private error: [Error] | Empty;
  public constructor(onFail: UnaryFn<Error>) {
    this.fn = onFail;
    this.disabled = false;
  }
  public get replete(): boolean {
    return Boolean(this.error);
  }
  public fail(error: Error, raise?: boolean): void {
    if (this.replete) {
      if (!raise) return;
      try {
        this.fn(error);
      } catch (err) {
        if (!this.disabled) throw err;
      }
    } else {
      try {
        this.fn(error);
      } catch (err) {
        this.error = [err];
        if (raise && !this.disabled) throw err;
      }
    }
  }
  public enable(): void {
    this.disabled = false;
  }
  public disable(): void {
    this.disabled = true;
  }
  public raise(): void {
    if (this.disabled || !this.error) return;
    throw this.error[0];
  }
}
