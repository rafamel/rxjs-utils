import { Empty, NullaryFn, UnaryFn, TypeGuard } from 'type-core';

export class Resolver {
  public static resolve<T, U = T, V = U>(
    fn: NullaryFn<Promise<T> | T>,
    data: Empty | UnaryFn<T, U>,
    error: Empty | UnaryFn<Error, V>
  ): U | V | Promise<U | V> {
    let response: T | Promise<T>;
    try {
      response = fn();
    } catch (err) {
      if (error) return error(err);
      throw err;
    }

    if (TypeGuard.isPromiseLike(response)) {
      return data || error
        ? response.then(data || undefined, error || undefined)
        : (response as Promise<any>);
    } else {
      return data ? data(response) : (response as any);
    }
  }
}
