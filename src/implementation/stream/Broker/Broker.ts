import { Streams as Types } from '@definitions';
import { SafeInternal } from '../../helpers/safe-internal';
import { consume } from './consume';
import { StreamProvider, StreamConsumer } from '../definitions';

type SafeProperties = SafeInternal<{
  reference: { done: boolean };
  cancel: () => void;
}>;

const map = new WeakMap();

export class Broker<T, Primer extends T | void> implements Types.Broker {
  private safe: SafeProperties;
  public constructor(
    provider: () => StreamProvider<T, Primer>,
    consumer: () => StreamConsumer<T, Primer>
  ) {
    const reference = { done: false };
    const cancel = consume(provider, consumer, {
      getDone(): boolean {
        return reference.done;
      },
      setDone(): void {
        reference.done = true;
      }
    });

    this.safe = new SafeInternal(this, map, { reference, cancel });
  }
  public get done(): boolean {
    return this.safe.get(map, 'reference').done;
  }
  public cancel(): void {
    return this.safe.get(map).cancel();
  }
}
