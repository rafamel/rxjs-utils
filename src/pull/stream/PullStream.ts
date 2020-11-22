import { Pull } from '@definitions';
import { Consume, Validate } from './helpers';
import { StreamIterator } from './StreamIterator';

export class PullStream<O = any, I = void> implements Pull.PullStream<O, I> {
  #source: Pull.Source<O, I>;
  public constructor(provider: Pull.Provider<O, I>) {
    Validate.provider(provider);
    this.#source = () => new StreamIterator(provider());
  }
  public [Symbol.asyncIterator](): Pull.Iterator<O, I> {
    const source = this.source();
    return {
      async next(value: I): Promise<IteratorResult<O, void>> {
        const result = await source.next(value);
        return {
          done: result.complete || false,
          value: result.value
        } as any;
      },
      async throw(error: Error): Promise<IteratorResult<O, void>> {
        const result = await source.error(error);
        return {
          done: result.complete || false,
          value: result.value
        } as any;
      },
      async return(): Promise<IteratorResult<O, void>> {
        await source.complete();
        return { done: true, value: undefined };
      }
    };
  }
  public get source(): Pull.Source<O, I> {
    return this.#source;
  }
  public consume(consumer: Pull.Consumer<O, I>): void {
    Validate.consumer(consumer);

    const sink = new StreamIterator(consumer());
    const source = this.source();

    Consume.process(source, sink, undefined);
  }
}
