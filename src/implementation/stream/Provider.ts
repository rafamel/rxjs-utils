import { Streams as Types } from '@definitions';
import { SafeInternal } from '../helpers/safe-internal';

type SafeProperties<O, I> = SafeInternal<{
  status: Types.Status;
  self: Types.Consumer<I>;
  opposite: Provider<I, O>;
}>;

const map = new WeakMap();

export class Provider<O, I> implements Types.Provider<I> {
  public static pair<O, I>(
    a: Types.Executor<O, I>,
    b: Types.Executor<I, O>
  ): [Provider<O, I>, Provider<I, O>] {
    const self = new Provider(a, (self) => new Provider(b, () => self));

    return [self, (self.safe as SafeProperties<O, I>).get(map).opposite];
  }
  private safe: SafeProperties<O, I> | undefined;
  private constructor(
    self: Types.Executor<O, I>,
    opposite: (streamer: Provider<O, I>) => Provider<I, O>
  ) {
    const oppositeProvider = opposite(this);
    const consumer = typeof self === 'function' ? self(oppositeProvider) : self;

    this.safe = new SafeInternal(this, map, {
      status: 'idle',
      self:
        typeof consumer === 'function' ? { data: consumer } : consumer || {},
      opposite: oppositeProvider
    });
  }
  public get status(): Types.Status {
    return this.safe ? this.safe.get(map, 'status') : 'idle';
  }
  public open(): void {
    if (this.status !== 'idle' || !this.safe) return;

    this.safe.set(map, 'status', 'open');
    const { self } = this.safe.get(map);
    if (self.open) self.open();
  }
  public data(value: I): void {
    this.open();
    if (this.status !== 'open' || !this.safe) return;

    const { self } = this.safe.get(map);
    if (self.data) self.data(value);
  }
  public close(error?: Error): void {
    this.open();
    if (this.status !== 'open' || !this.safe) return;

    this.safe.set(map, 'status', 'close');

    const { self } = this.safe.get(map);
    if (self.close) self.close(error);
    else if (error) throw error;
  }
  public unregister(): void {
    if (!this.safe) return;

    this.close();
    const { opposite } = this.safe.get(map);
    opposite.close();
  }
}
