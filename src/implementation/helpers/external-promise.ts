export interface ExternalPromise<T> {
  done: boolean;
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

export function externalPromise<T = any>(): ExternalPromise<T> {
  let res: void | ((value: T) => void);
  let rej: void | ((reason: Error) => void);
  let resolved: T;
  let rejected: Error;

  let done = false;
  const promise = new Promise<T>((resolve, reject) => {
    if (resolved) return resolve(resolved);
    if (rejected) return reject(rejected);
    res = resolve;
    rej = reject;
  });

  return {
    get done(): boolean {
      return done;
    },
    promise,
    resolve(value: T): void {
      if (res) res(value);
      else if (!done) resolved = value;
      done = true;
    },
    reject(reason: Error): void {
      if (rej) rej(reason);
      else if (!done) rejected = reason;
      done = true;
    }
  };
}
