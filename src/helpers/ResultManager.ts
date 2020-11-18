import { Empty, UnaryFn } from '@definitions';

const empty = Symbol('empty');

export class ResultManager<T = void> {
  private onPassCb: Empty | UnaryFn<T>;
  private onFailCb: Empty | UnaryFn<Error>;
  private result: Empty | [T, typeof empty] | [typeof empty, Error];
  public get replete(): boolean {
    return Boolean(this.result);
  }
  public pass(value: T): void {
    if (this.result) return;

    this.result = [value, empty];
    const cb = this.onPassCb;
    if (cb) cb(value);
  }
  public fail(error: Error): void {
    if (this.result) return;

    this.result = [empty, error];
    const cb = this.onFailCb;
    if (cb) cb(error);
  }
  public onPass(fn: UnaryFn<T>): void {
    if (this.onPassCb) return;

    this.onPassCb = fn;
    const result = this.result;
    if (result) {
      const value = result[0];
      if (value !== empty) fn(value);
    }
  }
  public onFail(fn: UnaryFn<Error>): void {
    if (this.onFailCb) return;

    this.onFailCb = fn;
    const result = this.result;
    if (result) {
      const error = result[1];
      if (error !== empty) fn(error);
    }
  }
}
