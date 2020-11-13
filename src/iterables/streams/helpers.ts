import { Iterables } from '@definitions';
import { Resolver, TypeGuard } from '@helpers';

export class Validate {
  public static provider(provider: Iterables.Provider<any, any>): void {
    if (!TypeGuard.isFunction(provider)) {
      throw new TypeError(`Expected Provider to be a function`);
    }
  }
  public static consumer(consumer: Iterables.Consumer<any, any>): void {
    if (!TypeGuard.isFunction(consumer)) {
      throw new TypeError(`Expected Consumer to be a function`);
    }
  }
  public static counter(iterator: Iterables.CounterIterator<any, any>): void {
    if (!TypeGuard.isObject(iterator)) {
      throw new TypeError('Expected Iterator to be an object');
    }
  }
}

export class Consume {
  public static process<T, U>(
    current: Iterables.StreamIterator<T, U>,
    opposite: Iterables.StreamIterator<U, T>,
    value: U
  ): void {
    Resolver.resolve(
      () => current.next(value),
      (result) => {
        if (!result.complete) {
          return this.process(opposite, current, result.value as T);
        }
        return opposite.complete();
      },
      (err) => {
        return Resolver.resolve(
          () => opposite.error(err),
          (result) => {
            if (!result.complete) {
              return this.process(current, opposite, result.value as U);
            }
            return current.complete();
          }
        );
      }
    );
  }
}