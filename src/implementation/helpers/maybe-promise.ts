export function handleMaybePromise<T>(
  fn: () => Promise<T> | T,
  data?: (value: T) => void,
  error?: (err: Error) => void
): void {
  let response: T | Promise<T>;
  try {
    response = fn();
  } catch (err) {
    return error && error(err);
  }

  if (isPromiseLike(response)) {
    response.then(data, error);
  } else {
    data && data(response);
  }
}

export function isPromiseLike(item: any): item is PromiseLike<unknown> {
  const typeofItem = typeof item;
  return (
    ((typeofItem === 'object' && item !== null) || typeofItem === 'function') &&
    typeof item.then === 'function'
  );
}
