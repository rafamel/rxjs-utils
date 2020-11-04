export function catches(fn: () => void): void {
  try {
    fn();
  } catch (_) {}
}
