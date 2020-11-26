export type Empty = null | void | undefined;
export type WideRecord<T = any> = Record<any, T>;
export type NoParamFn<T = void> = () => T;
export type UnaryFn<T, U = void> = (arg: T) => U;
export type BinaryFn<T extends [any, any], V = void> = (...args: T) => V;
export type Union<A, B, C = B, D = B, E = B> = A | B | C | D | E;
export type Intersection<A, B, C = B, D = B, E = B> = A & B & C & D & E;
