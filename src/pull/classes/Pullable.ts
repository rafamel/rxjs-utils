import { Pull } from '@definitions';
import { TypeGuard } from 'type-core';
import { isPullableCompatible, isPullableLike } from '../utils';
import { Consume, From, Validate } from './helpers';
import { PullableIterator } from './PullableIterator';

export class Pullable<O = any, I = void> implements Pull.Pullable<O, I> {
  #source: Pull.Source<O, I>;
  public static from<O, I = void>(
    item: Pull.Convertible<O, I>
  ): Pullable<O, I> {
    if (item instanceof Pullable) return item;

    if (isPullableLike(item)) {
      return new Pullable(item.source as Pull.Source<O, I>);
    }

    if (isPullableCompatible(item)) {
      return From.asyncIteratorToPullable(
        this,
        () => item[Symbol.asyncIterator]() as AsyncIterator<O, void, I>
      ) as Pullable<O, I>;
    }

    if (TypeGuard.isIterable(item)) {
      return From.iteratorToPullable(
        this,
        () => item[Symbol.iterator]() as Iterator<O, void, I>
      ) as Pullable<O, I>;
    }

    throw new TypeError(`Unable to convert ${typeof item} into a Pullable`);
  }
  public constructor(provider: Pull.Provider<O, I>) {
    Validate.provider(provider);
    this.#source = () => new PullableIterator(provider());
  }
  public [Symbol.asyncIterator](): AsyncIterator<O, void, I> {
    return From.pullableToAsyncIterator(this);
  }
  public get source(): Pull.Source<O, I> {
    return this.#source;
  }
  public consume(consumer: Pull.Consumer<O, I>): void {
    Validate.consumer(consumer);

    const sink = new PullableIterator(consumer());
    const source = this.source();

    Consume.process(source, sink, undefined);
  }
}
