/* Stream */
export interface StreamConstructor {
  new <T, Primer extends T | void = void>(
    executor: ProviderExecutor<T, Primer>
  ): Stream<T, Primer>;
}

export interface Stream<T, Primer extends T | void> {
  primer(): Primer;
  execute(): Provider<T, Primer>;
  consume(executor: ConsumerExecutor<T, Primer>): Broker;
}

export interface SubjectStream<T, Primer extends T | void = any>
  extends Stream<T, Primer> {
  data(value: T): void;
  close(error?: Error): void;
}

/* Provider */
export type ProviderExecutor<T, Primer extends T | void> = () => Partial<
  Provider<T, Primer>
>;

export interface Provider<T, Primer extends T | void> {
  open(): Primer;
  data(): Response<T>;
  close(): void;
}

/* Consumer */
export type ConsumerExecutor<T, Primer extends T | void> = () => Partial<
  Consumer<T, Primer>
>;

export interface Consumer<T, Primer extends T | void> {
  open(primer: Primer): void;
  data(value: T): Resolve<void | boolean>;
  close(error?: Error): void;
}

/* Broker */
export interface Broker {
  done: boolean;
  cancel(): void;
}

/* Response */
export type Response<T> = Resolve<Result<T>>;

export type Resolve<T> = T | Promise<T>;

export type Result<T> =
  | { done: true; value?: void }
  | { done?: false; value: T }
  | (T extends void | undefined
      ? { done?: false; value?: T }
      : { done?: false; value: T });
