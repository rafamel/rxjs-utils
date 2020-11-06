import { UnaryFn } from '../definitions';

interface PromiserSubject<T> {
  promise: Promise<T>;
  resolve: UnaryFn<T>;
  reject: UnaryFn<Error>;
}

type PromiserResult<T> =
  | { type: 'value'; data: T }
  | { type: 'error'; data: Error };

export class Promiser<T = void> {
  private subject: void | PromiserSubject<T>;
  private result: void | PromiserResult<T>;
  public get done(): boolean {
    return Boolean(this.result);
  }
  public get promise(): Promise<T> {
    if (this.subject) return this.subject.promise;
    if (this.result) {
      return this.result.type === 'value'
        ? Promise.resolve(this.result.data)
        : Promise.reject(this.result.data);
    }

    const subject: any = {};
    const promise = (subject.promise = new Promise<T>((resolve, reject) => {
      subject.resolve = resolve;
      subject.reject = reject;
    }));
    this.subject = subject;
    return promise;
  }
  public resolve(value: T): void {
    if (this.result) return;

    this.result = { type: 'value', data: value };
    if (this.subject) return this.subject.resolve(value);
  }
  public reject(error: Error): void {
    if (this.result) return;

    this.result = { type: 'error', data: error };
    if (this.subject) return this.subject.reject(error);
  }
}
