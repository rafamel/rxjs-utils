/* Classes */
export interface Constructor {
  new <O, I = void>(provider: Provider<O, I>): Stream<O, I>;
}

export interface Stream<O, I = void> {
  source: Source<O, I>;
  consume(sink: Consumer<O, I>): void;
}

/* Constituents */
export type Source<O, I = void> = Constituent<I, O>;
export type Sink<O, I = void> = Constituent<O, I>;
export interface Constituent<T, U> {
  (exchange: (talkback: Talkback<T>) => Talkback<U>): void;
}

/* Counterparts */
export type Provider<O, I = void> = Counterpart<I, O>;
export type Consumer<O, I = void> = Counterpart<O, I>;
export interface Counterpart<T, U> {
  (exchange: (hearback?: Hearback<T>) => Talkback<U>): void;
}

/* Actions */
export interface Hearback<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
  terminate?: () => void;
}

export interface Talkback<T> extends Hearback<T> {
  closed: boolean;
  next: (value: T) => void;
  error: (error: Error) => void;
  complete: () => void;
  terminate: () => void;
}
