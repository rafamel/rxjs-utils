import { Streams as Types } from '@definitions';

/* Streams */
export type ForeStream<O> = PureStream<O, O>;
export type PureStream<O, Primer = any> = ProcedureStream<O, void, Primer>;
export type ProcedureStream<O, I, Primer = any> = Types.Stream<O, I, Primer>;

/* Other */
export type StreamBroker = Types.Broker;
export type StreamResult<T> = Types.Result<T>;
export type StreamResponse<T> = Types.Response<T>;
export type StreamProvider<O, I, Primer> = Types.Provider<O, I, Primer>;
export type StreamConsumer<O, I, Primer> = Types.Consumer<O, I, Primer>;
