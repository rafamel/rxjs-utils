export interface Iterable<O, I = void> {
  [Symbol.asyncIterator](): Iterator<O, I>;
}

export type Iterator<O, I> = AsyncIterator<O, void, I>;
