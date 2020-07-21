import { Provider } from './Provider';
import { SafeInternal } from '../helpers/safe-internal';
import { Streams as Types } from '@definitions';

const map = new WeakMap();

type SafeProperties<O, I> = SafeInternal<{
  a: Provider<O, I>;
  b: Provider<I, O>;
}>;

export class Registration<O, I> implements Types.Registration {
  private safe: SafeProperties<O, I>;
  public constructor(a: Provider<O, I>, b: Provider<I, O>) {
    this.safe = new SafeInternal(this, map, { a, b });
    a.open();
    b.open();
  }
  public get done(): boolean {
    const { a, b } = this.safe.get(map);
    return a.status === 'close' && b.status === 'close';
  }
  public unregister(): void {
    const { a, b } = this.safe.get(map);
    a.close();
    b.close();
  }
}
