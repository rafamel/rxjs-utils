export type Empty = null | void | undefined;
export type WideRecord = Record<any, any>;
export type UnaryFn<T, U = void> = (value: T) => U;
export type NoParamFn<T = void> = () => T;
