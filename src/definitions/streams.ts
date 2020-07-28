import { MultiPipe } from 'pipettes/dist/types/multi';

/* Stream */
export interface StreamConstructor {
  new <O, I = void, Primer = void>(
    executor: () => Provider<O, I, Primer>
  ): Stream<O, I, Primer>;
}

export interface Stream<O, I, Primer> {
  probe(): Primer;
  engage(): Provider<O, I, Primer>;
  consume(executor: () => Consumer<O, I, Primer>): Broker;
  pipe: MultiPipe<Stream<O, I, Primer>, Stream<O, I, Primer>, false, true>;
}

export interface PushStream<O, Primer> extends Stream<O, void, Primer> {
  subscribe(): Broker;
}

export interface SubjectStream<O, Primer = any> extends PushStream<O, Primer> {
  data(value: O): void;
  error(error: Error): void;
  done(): void;
}

/* Provider */
export interface Provider<O, I, Primer> {
  open?(): Primer;
  data?(value: I): Resolve<Response<O>>;
  error?(error: Error): Resolve<Response<O>>;
  close?(): void;
}

/* Consumer */
export type Consumer<O, I, Primer> =
  | ProcedureConsumer<O, I, Primer>
  | (I extends void | undefined
      ? PartialConsumer<O, I, Primer>
      : ProcedureConsumer<O, I, Primer>);

export interface PartialConsumer<O, I, Primer> {
  open?(primer: Primer): I;
  data?(value: O): Resolve<Response<I>>;
  error?(error: Error): Resolve<Response<I>>;
  close?(): void;
}

export interface ProcedureConsumer<O, I, Primer>
  extends PartialConsumer<O, I, Primer> {
  open(primer: Primer): I;
  data(value: O): Resolve<Response<I>>;
}

/* Broker */
export interface Broker {
  done: boolean;
  cancel(): void;
}

/* Response */
export type Resolve<T> = T | Promise<T>;

export type Response<T> =
  | Result<T>
  | (T extends void | undefined ? Result<T> | void : Result<T>);

export type Result<T> =
  | { done: true; value?: void }
  | { done?: false; value: T }
  | (T extends void | undefined
      ? { done?: false; value?: T }
      : { done?: false; value: T });
