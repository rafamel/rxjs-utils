import { SafeInternal } from '../helpers/safe-internal';
import {
  StreamBroker,
  StreamResponse,
  StreamProvider,
  StreamExecutor,
  StreamConsumer,
  StreamResult,
  StreamReason,
  StreamLike,
  Streamer
} from '@definitions';
import { Broker } from './Broker';
import { ExternalPromise, externalPromise } from '../helpers/external-promise';

type SafeProperties<T> = SafeInternal<{
  executor: () => StreamProvider<T>;
}>;

const map = new WeakMap();

const noop = (): void => undefined;
const complete = (): StreamResponse<any> => ({ complete: true });
const stop = (): boolean => true;
const raise = (_: StreamReason, error?: Error): void => {
  if (error) throw error;
};

class Stream<T> implements StreamLike<T> {
  public static push<T>(
    executor: (streamer: Streamer<T>) => void | (() => void)
  ): Stream<T> {
    return new this(() => {
      let queue: T[] = [];
      let external: null | ExternalPromise<StreamResult<T>> = null;
      let done = false;
      let error: Error | null = null;

      const subject = {
        data(value: T) {
          if (done) return;

          if (external) {
            external.resolve({ value });
            external = null;
          } else {
            queue.push(value);
          }
        },
        close(err?: Error) {
          if (done) return;

          if (err) error = err;
          done = true;

          if (external) {
            if (err) external.reject(err);
            else external.resolve({ complete: true });
            external = null;
          }
        }
      };

      let onclose = executor(subject);
      return {
        data(): StreamResponse<T> {
          if (queue.length) return { value: queue.shift() as T };

          if (done) {
            if (error) throw error;
            return { complete: true };
          }

          if (external) return external.promise;

          external = externalPromise<StreamResult<T>>();
          return external.promise;
        },
        close(): void {
          subject.close();
          if (onclose) onclose();
          onclose = undefined;
          queue = [];
        }
      };
    });
  }
  private safe: SafeProperties<T>;
  public constructor(executor: StreamExecutor<T>) {
    this.safe = new SafeInternal(this, map, {
      executor() {
        const provider = executor();
        return {
          data: provider.data ? provider.data.bind(provider) : complete,
          close: provider.close ? provider.close.bind(provider) : noop
        } as StreamProvider<T>;
      }
    });
  }
  public execute(): StreamProvider<T> {
    const { executor } = this.safe.get(map);
    return executor();
  }
  public consume(consumer: Partial<StreamConsumer<T>>): StreamBroker {
    return new Broker(this.safe.get(map, 'executor'), {
      data: consumer.data ? consumer.data.bind(consumer) : stop,
      close: consumer.close ? consumer.close.bind(consumer) : raise
    });
  }
}

// Stream.prototype.pipe = function pipe(...args: any[]): any {
//   return into(this, ...args);
// };

export { Stream };
