/* Classes */
export interface Constructor {
  new <O, R = void, I = void, S = void>(provider: Provider<O, R, I, S>): Stream<
    O,
    R,
    I,
    S
  >;
}

export interface Stream<O, R = void, I = void, S = void> {
  source: Source<O, R, I, S>;
  consume(sink: Consumer<O, R, I, S>): void;
}

/* Constituents */
export type Source<O, R = void, I = void, S = void> = Constituent<I, S, O, R>;
export type Sink<O, R = void, I = void, S = void> = Constituent<O, R, I, S>;
export interface Constituent<T, TR, U, UR> {
  (exchange: (talkback: Talkback<T, TR>) => Talkback<U, UR>): void;
}

/* Counterparts */
export type Provider<O, R = void, I = void, S = void> = Counterpart<I, S, O, R>;
export type Consumer<O, R = void, I = void, S = void> = Counterpart<O, R, I, S>;
export interface Counterpart<T, TR, U, UR> {
  (exchange: (hearback?: Hearback<T, TR>) => Talkback<U, UR>): void;
}

/* Actions */
export interface Hearback<T, R = void> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: (reason: R) => void;
  terminate?: () => void;
}

export interface Talkback<T, R = void> extends Hearback<T, R> {
  closed: boolean;
  next: (value: T) => void;
  error: (error: Error) => void;
  complete: (reason: R) => void;
  terminate: () => void;
}
