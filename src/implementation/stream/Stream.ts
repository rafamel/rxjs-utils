import { SafeInternal } from '../helpers/safe-internal';
import { Streams as Types } from '@definitions';
import {
  StreamBroker,
  StreamResponse,
  StreamProvider,
  StreamExecutor,
  StreamConsumer,
  StreamResult,
  StreamSubject
} from './definitions';
import { Broker } from './Broker';
import { ExternalPromise, externalPromise } from '../helpers/external-promise';

type SafeProperties<T, Primer> = SafeInternal<{
  executor: () => StreamProvider<T, Primer>;
}>;

const map = new WeakMap();

const noop = (): void => undefined;
const complete = (): StreamResponse<any> => ({ done: true });
const stop = (): boolean => true;
const raise = (error?: Error): void => {
  if (error) throw error;
};

class Stream<T, Primer> implements Types.Stream<T, Primer> {
  public static push<T>(
    executor: (subject: StreamSubject<T>) => void | (() => void)
  ): Stream<T, void> {
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
            else external.resolve({ done: true });
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
            return { done: true };
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
  private safe: SafeProperties<T, Primer>;
  public constructor(executor: StreamExecutor<T, Primer>) {
    this.safe = new SafeInternal(this, map, {
      executor() {
        const provider = executor();
        return {
          prime: provider.prime ? provider.prime.bind(provider) : noop,
          data: provider.data ? provider.data.bind(provider) : complete,
          close: provider.close ? provider.close.bind(provider) : noop
        } as StreamProvider<T, Primer>;
      }
    });
  }
  public primer(): Primer {
    let value: Primer = undefined as any;
    let error: null | Error = null;

    this.consume({
      prime(primer: Primer): boolean {
        value = primer;
        return true;
      },
      close(err?: Error): void {
        if (err) error = err;
      }
    });

    if (error) throw error;
    return value;
  }
  public execute(): StreamProvider<T, Primer> {
    const { executor } = this.safe.get(map);
    return executor();
  }
  public consume(consumer: Partial<StreamConsumer<T, Primer>>): StreamBroker {
    return new Broker(this.safe.get(map, 'executor'), {
      prime: consumer.prime ? consumer.prime.bind(consumer) : noop,
      data: consumer.data ? consumer.data.bind(consumer) : stop,
      close: consumer.close ? consumer.close.bind(consumer) : raise
    });
  }
}

// Stream.prototype.pipe = function pipe(...args: any[]): any {
//   return into(this, ...args);
// };

export { Stream };
