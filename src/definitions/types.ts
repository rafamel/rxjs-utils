export type Empty = null | void | undefined;
export type UnaryFn<T, U = void> = (value: T) => U;
export type NoParamFn<T = void> = () => T;
