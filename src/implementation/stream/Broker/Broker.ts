import { SafeInternal } from '../../helpers/safe-internal';
import { consume } from './consume';
import { StreamProvider, StreamConsumer, StreamBroker } from '@definitions';

type SafeProperties = SafeInternal<{
  done: boolean;
  promise: Promise<void>;
  cancel: () => void;
}>;

const map = new WeakMap();

export class Broker<T> implements StreamBroker {
  private safe: SafeProperties;
  public constructor(
    provider: () => StreamProvider<T>,
    consumer: StreamConsumer<T>
  ) {
    this.safe = new SafeInternal(this, map, consume(provider, consumer));
  }
  public get [Symbol.toStringTag](): string {
    return 'Promise';
  }
  public get done(): boolean {
    return this.safe.get(map, 'done');
  }
  public then<F = void, R = never>(
    onfulfilled?: ((value: void) => F | Promise<F>) | null,
    onrejected?: ((reason: any) => R | Promise<R>) | null
  ): Promise<F | R> {
    return this.safe.get(map, 'promise').then(onfulfilled, onrejected);
  }
  public catch<R = never>(
    onrejected?: ((reason: any) => R | Promise<R>) | null
  ): Promise<void | R> {
    return this.then(undefined, onrejected);
  }
  public finally(fn: (() => void) | undefined | null): Promise<void> {
    return this.then(
      (value) => Promise.resolve(fn && fn()).then(() => value),
      (reason) => Promise.resolve(fn && fn()).then(() => Promise.reject(reason))
    );
  }
  public cancel(): void {
    return this.safe.get(map).cancel();
  }
}
