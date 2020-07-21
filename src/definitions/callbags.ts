export type Type = START | DATA | END;
export type START = 0;
export type DATA = 1;
export type END = 2;

export type DataType<O, I> = Callbag<I, O> | I | Error | undefined;

export interface Callbag<O, I> {
  (type: START, data: Callbag<I, O>): void;
  (type: DATA, data: I): void;
  (type: END, data?: Error): void;
  (type: Type, data?: DataType<O, I>): void;
}

export type Source<T> = Callbag<T, void>;
export type Sink<T> = Callbag<void, T>;

// export type Multibag<O, I> = (signal: MultiSignal<O, I>) => void;
// export type MultiSignal<O, I> =
//   | { type: START; data: Multibag<I, O> }
//   | { type: DATA; data: I }
//   | { type: END; data?: Error };
// export type MultiSinkSignal<T> = MultiSignal<void, T>;
// export type MultiSourceSignal<T> = MultiSignal<T, void>;
