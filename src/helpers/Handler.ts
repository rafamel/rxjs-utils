import { Empty, NullaryFn, UnaryFn } from 'type-core';

export class Handler {
  public static noop(): void {
    return undefined;
  }
  public static identity<T>(value: T): T {
    return value;
  }
  public static tries(
    tries: Empty | NullaryFn,
    catches: Empty | UnaryFn<Error>,
    finalizes: Empty | NullaryFn
  ): void {
    try {
      if (tries) tries();
    } catch (err) {
      if (catches) catches(err);
    } finally {
      if (finalizes) finalizes();
    }
  }
  public static throws(error: Error): never {
    throw error;
  }
}
