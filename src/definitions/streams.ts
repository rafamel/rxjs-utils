import { Resolve } from './utils';
import { Observable } from './observables';

/* Stream */
export interface StreamConstructor {
  new <T>(executor: StreamExecutor<T>): StreamLike<T>;
}

export type StreamExecutor<T> = () => Partial<StreamProvider<T>>;

export interface Streamer<T> {
  data(value: T): void;
  close(error?: Error): void;
}

export interface StreamLike<T> {
  execute(): StreamProvider<T>;
  consume(consumer: Partial<StreamConsumer<T>>): StreamBroker;
}

export type ObservableStreamLike<T> = Observable<T> & StreamLike<T>;

/* Provider */
export interface StreamProvider<T> {
  data(): StreamResponse<T>;
  close(): void;
}

/* Consumer */
export interface StreamConsumer<T> {
  data(value: T): Resolve<void | boolean>;
  close(reason: StreamReason, error?: Error): void;
}

export type StreamReason = 'complete' | 'cancel' | 'terminate';

/* Broker */
export interface StreamBroker extends Promise<void> {
  done: boolean;
  cancel(): void;
}

/* Response */
export type StreamResponse<T> = Resolve<StreamResult<T>>;

export type StreamResult<T> =
  | { complete: true; value?: void }
  | { complete?: false; value: T }
  | (T extends void | undefined
      ? { complete?: false; value?: T }
      : { complete?: false; value: T });
