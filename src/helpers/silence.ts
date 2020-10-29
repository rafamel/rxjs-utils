export function silence(fn: () => void): [Error] | void {
  try {
    fn();
  } catch (err) {
    return err;
  }
}
