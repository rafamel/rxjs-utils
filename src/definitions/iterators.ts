export interface Iterator<O, I = void> extends AsyncIterator<O, void, I> {
  next(...args: [] | [I]): Promise<Result<O>>;
  return?(): Promise<ReturnResult>;
  throw?(error: Error): Promise<ReturnResult>;
}

export interface Iterable<O, I = void> {
  [Symbol.asyncIterator](): Iterator<O, I>;
}

export interface IterableIterator<O, I = void> extends Iterator<O, I> {
  [Symbol.asyncIterator](): IterableIterator<O, I>;
}

export type Result<T> = YieldResult<T> | ReturnResult;
export type YieldResult<T> = IteratorYieldResult<T>;
export type ReturnResult = { done: true; value: void };
