import { SafeInternal } from '../helpers/safe-internal';
import { Streams as Types } from '@definitions';
import { StreamBroker, StreamResponse, StreamProvider } from './definitions';
import { Broker } from './Broker';

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

class Stream<T, Primer extends T | void = void>
  implements Types.Stream<T, Primer> {
  private safe: SafeProperties<T, Primer>;
  public constructor(executor: Types.ProviderExecutor<T, Primer>) {
    this.safe = new SafeInternal(this, map, {
      executor() {
        const provider = executor();
        return {
          open: provider.open ? provider.open.bind(provider) : noop,
          data: provider.data ? provider.data.bind(provider) : complete,
          close: provider.close ? provider.close.bind(provider) : noop
        } as StreamProvider<T, Primer>;
      }
    });
  }
  public primer(): Primer {
    let value: Primer = undefined as any;

    const broker = this.consume(() => ({
      open(primer: Primer): T {
        value = primer;
        return undefined as any;
      },
      data() {
        return true;
      }
    }));

    broker.cancel();
    return value as Primer;
  }
  public execute(): StreamProvider<T, Primer> {
    const { executor } = this.safe.get(map);
    return executor();
  }
  public consume(executor: Types.ConsumerExecutor<T, Primer>): StreamBroker {
    return new Broker(this.safe.get(map, 'executor'), () => {
      const consumer = executor();
      return {
        open: consumer.open ? consumer.open.bind(consumer) : noop,
        data: consumer.data ? consumer.data.bind(consumer) : stop,
        close: consumer.close ? consumer.close.bind(consumer) : raise
      };
    });
  }
}

// Stream.prototype.pipe = function pipe(...args: any[]): any {
//   return into(this, ...args);
// };

export { Stream };
