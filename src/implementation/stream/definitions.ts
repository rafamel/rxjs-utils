import { Streams as Types } from '@definitions';

export type ForeStream<T> = Types.Stream<T, T>;
export type PureStream<T> = Types.Stream<T, void>;
export type BroadStream<T, Primer = any> = Types.Stream<T, Primer>;

export type StreamBroker = Types.Broker;
export type StreamProvider<T, Primer> = Types.Provider<T, Primer>;
export type StreamConsumer<T, Primer> = Types.Consumer<T, Primer>;

export type StreamResult<T> = Types.Result<T>;
export type StreamResolve<T> = Types.Resolve<T>;
export type StreamResponse<T> = Types.Response<T>;
