import { Streams as Types } from '@definitions';

export type StreamBroker = Types.Broker;
export type StreamSubject<T> = Types.Subject<T>;

export type StreamResult<T> = Types.Result<T>;
export type StreamResolve<T> = Types.Resolve<T>;
export type StreamResponse<T> = Types.Response<T>;

export type StreamExecutor<T, Primer> = Types.Executor<T, Primer>;
export type StreamProvider<T, Primer> = Types.Provider<T, Primer>;
export type StreamConsumer<T, Primer> = Types.Consumer<T, Primer>;
