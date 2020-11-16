export interface PullStreamConstructor {
  new <O, I = void>(provider: Provider<O, I>): PullStream<O, I>;
}

export interface Iterable<O, I = void> {
  [Symbol.asyncIterator](): Iterator<O, I>;
}

export type Iterator<O, I> = AsyncIterator<O, void, I>;

export interface PullStream<O, I = void> extends Iterable<O, I> {
  source: Source<O, I>;
  consume(consumer: Consumer<O, I>): void;
}

export type Provider<O, I> = () => CounterIterator<O, I | void>;
export type Consumer<O, I> = () => CounterIterator<I, O>;

export type Source<O, I> = () => StreamIterator<O, I | void>;
export type Sink<O, I> = () => StreamIterator<I, O>;

export interface CounterIterator<O, I> {
  next?: (value: I) => Response<O>;
  error?: (error: Error) => Response<O>;
  complete?: () => void | Promise<void>;
}

export interface StreamIterator<O, I> extends CounterIterator<O, I> {
  next: (value: I) => Response<O>;
  error: (error: Error) => Response<O>;
  complete: () => void | Promise<void>;
}

export type Response<T> = Result<T> | Promise<Result<T>>;

export type Result<T> =
  | { complete: true; value?: void }
  | { complete?: false; value: T }
  | (T extends void | undefined
      ? { complete?: false; value?: T }
      : { complete?: false; value: T });
