import { SafeInternal } from '../helpers/safe-internal';
import { Streams as Types } from '@definitions';
import {
  StreamProvider,
  StreamConsumer,
  StreamResponse,
  StreamBroker
} from './definitions';
import { Broker } from './Broker';

type SafeProperties<O, I, Primer> = SafeInternal<{
  executor: () => StreamProvider<O, I, Primer>;
}>;

const map = new WeakMap();

class Stream<O, I, Primer> implements Types.Stream<O, I, Primer> {
  private safe: SafeProperties<O, I, Primer>;
  public constructor(executor: () => StreamProvider<O, I, Primer>) {
    this.safe = new SafeInternal(this, map, { executor });
  }
  public probe(): Primer {
    let value: Primer = undefined as any;

    const broker = this.consume(() => ({
      open(primer: Primer): I {
        value = primer;
        return undefined as any;
      },
      data(): StreamResponse<I> {
        return { done: true };
      }
    }));

    broker.cancel();
    return value as Primer;
  }
  public engage(): StreamProvider<O, I, Primer> {
    const { executor } = this.safe.get(map);
    return executor();
  }
  public consume(executor: () => StreamConsumer<O, I, Primer>): StreamBroker {
    return new Broker(this.safe.get(map, 'executor'), executor);
  }
}

// Stream.prototype.pipe = function pipe(...args: any[]): any {
//   return into(this, ...args);
// };

export { Stream };
