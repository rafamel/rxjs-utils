import { Empty, NoParamFn, UnaryFn } from '@definitions';

export class Handler {
  public static noop(): void {
    return undefined;
  }
  public static tries(
    tries: Empty | NoParamFn,
    catches: Empty | UnaryFn<Error>,
    finalizes: Empty | NoParamFn
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
