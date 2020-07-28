import { Streams as Types } from '@definitions';
import { SafeInternal } from '../../helpers/safe-internal';
import { StreamProvider, StreamConsumer } from '../definitions';
import { consume } from './consume';

type SafeProperties<O, I, Primer> = SafeInternal<{
  reference: { done: boolean };
  cancel: () => void;
}>;

const map = new WeakMap();

export class Broker<O, I, Primer> implements Types.Broker {
  private safe: SafeProperties<O, I, Primer>;
  public constructor(
    provider: () => StreamProvider<O, I, Primer>,
    consumer: () => StreamConsumer<O, I, Primer>
  ) {
    const reference = { done: false };
    const cancel = consume(
      {
        getDone(): boolean {
          return reference.done;
        },
        setDone(): void {
          reference.done = true;
        }
      },
      provider,
      consumer
    );

    this.safe = new SafeInternal(this, map, { reference, cancel });
  }
  public get done(): boolean {
    return this.safe.get(map, 'reference').done;
  }
  public cancel(): void {
    return this.safe.get(map).cancel();
  }
}
