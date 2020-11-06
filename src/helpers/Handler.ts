export class Handler {
  public static noop(): void {
    return undefined;
  }
  public static catches(fn: () => void): void {
    try {
      fn();
    } catch (_) {}
  }
  public static throws(error: Error): never {
    throw error;
  }
}
