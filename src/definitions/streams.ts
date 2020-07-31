/* Stream */
export interface StreamConstructor {
  new <T, Primer>(executor: Executor<T, Primer>): Stream<T, Primer>;
}

export type Executor<T, Primer> = () => Partial<Provider<T, Primer>>;

export interface Subject<T> {
  data(value: T): void;
  close(error?: Error): void;
}

export interface Stream<T, Primer> {
  primer(): Primer;
  execute(): Provider<T, Primer>;
  consume(consumer: Partial<Consumer<T, Primer>>): Broker;
}

export type SubjectStream<T, Primer> = Stream<T, Primer> & Subject<T>;

/* Provider */
export interface Provider<T, Primer> {
  prime(): Primer;
  data(): Response<T>;
  close(): void;
}

/* Consumer */
export interface Consumer<T, Primer> {
  prime(primer: Primer): void | boolean;
  data(value: T): Resolve<void | boolean>;
  close(error?: Error): void;
}

/* Broker */
export interface Broker extends Promise<void> {
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
