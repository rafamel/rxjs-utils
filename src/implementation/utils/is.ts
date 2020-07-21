import SymbolObservable from 'symbol-observable';
import { Observables as Types } from '@definitions';

export function isIterable(value: any): value is Iterable<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value[Symbol.iterator] === 'function'
  );
}

export function isAsyncIterable(value: any): value is AsyncIterable<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value[Symbol.asyncIterator] === 'function'
  );
}

export function isObservable(value: any): value is Types.Observable<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (typeof value[SymbolObservable] === 'function' ||
      typeof value['@@observable'] === 'function') &&
    typeof value.subscribe === 'function'
  );
}
