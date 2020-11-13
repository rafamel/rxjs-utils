export type Empty = null | void | undefined;
export type WideRecord = Record<any, any>;
export type NoParamFn<T = void> = () => T;
export type UnaryFn<T, U = void> = (arg: T) => U;
export type BinaryFn<T, U, V = void> = (...args: [T, U]) => V;
