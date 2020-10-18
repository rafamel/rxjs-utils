export interface NopFn<T = void> {
  (): T;
}

export interface UnaryFn<T, U = void> {
  (value: T): U;
}
