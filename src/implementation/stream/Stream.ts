import { SafeInternal } from '../helpers/safe-internal';
import { Streams as Types } from '@definitions';
import { Provider } from './Provider';
import { Registration } from './Registration';

type SafeProperties<O, I, C> = SafeInternal<{
  executor: Types.Executor<O, I, C>;
}>;

const map = new WeakMap();

export class Stream<
  O,
  I = void,
  C extends Types.ExecutorResult<I> = Types.ExecutorResult<I>
> implements Types.Stream<O, I, C> {
  private safe: SafeProperties<O, I, C>;
  public constructor(executor: Types.Executor<O, I, C>) {
    this.safe = new SafeInternal(this, map, { executor });
  }
  public get executor(): Types.Executor<O, I, C> {
    return this.safe.get(map, 'executor');
  }
  public register(executor: Types.Executor<I, O>): Types.Registration {
    const sourceExecutor = this.executor;
    const destinationExecutor = executor;

    const [destinationProvider, sourceProvider] = Provider.pair(
      destinationExecutor,
      sourceExecutor
    );

    return new Registration(destinationProvider, sourceProvider);
  }
}

export class PushStream<T> extends Stream<T, void, Types.PushConsumer | void> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(executor: Types.PushExecutor<T>) {
    super(executor);
  }
}
