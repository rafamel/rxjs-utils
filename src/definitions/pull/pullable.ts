import { MaybePromise } from 'type-core';
import { Iterable } from './iterable';

/* Constructor */
export interface PullableConstructor {
  new <O, I = void>(provider: Provider<O, I>): Pullable<O, I>;
}

/* Pullable */
export interface Pullable<O, I = void> extends Iterable<O, I> {
  source: Source<O, I>;
  consume(consumer: Consumer<O, I>): void;
}

/* Components */
export type Provider<O, I> = () => PureIterator<O, I | void>;
export type Consumer<O, I> = () => PureIterator<I, O>;

export type Source<O, I> = () => PullableIterator<O, I | void>;
export type Sink<O, I> = () => PullableIterator<I, O>;

/* Iterators */
// TODO: add "finally" to iterators
export interface PureIterator<O, I> {
  next?: (value: I) => MaybePromise<Response<O>>;
  error?: (error: Error) => MaybePromise<Response<O>>;
  complete?: () => MaybePromise<void>;
}

export interface PullableIterator<O, I> extends PureIterator<O, I> {
  next: (value: I) => MaybePromise<Response<O>>;
  error: (error: Error) => MaybePromise<Response<O>>;
  complete: () => MaybePromise<void>;
}

/* Response */
export type Response<T> =
  | { complete: true; value?: void }
  | { complete?: false; value: T }
  | (T extends void | undefined
      ? { complete?: false; value?: T }
      : { complete?: false; value: T });
