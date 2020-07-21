export interface StreamConstructor {
  new <O, I = void>(executor: Executor<O, I>): Stream<O, I>;
}

export interface Stream<
  O,
  I = void,
  C extends ExecutorResult<I> = ExecutorResult<I>
> {
  executor: Executor<O, I, C>;
  register(executor: Executor<I, O>): Registration;
}

export type PushStream<T> = Stream<T, void, PushConsumer | void>;

export type PushExecutor<T> = (provider: Provider<T>) => PushConsumer | void;

export type Executor<
  O,
  I = void,
  C extends ExecutorResult<I> = ExecutorResult<I>
> = Consumer<I> | ((provider: Provider<O>) => C);

export type ExecutorResult<T> = Consumer<T> | DataConsumer<T> | void;

export interface PushConsumer {
  data?: never;
  open?(): void;
  close?(error: Error | undefined): void;
}

export interface Consumer<T> {
  open?(): void;
  data?(value: T): void;
  close?(error: Error | undefined): void;
}

export type DataConsumer<T> = (value: T) => void;

export interface Provider<T> {
  status: Status;
  open(): void;
  data(value: T): void;
  close(error?: Error): void;
  unregister(): void;
}

export type Status = 'idle' | 'open' | 'close';

export interface Registration {
  done: boolean;
  unregister(): void;
}
