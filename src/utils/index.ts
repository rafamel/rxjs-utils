import { Core, Observables } from '../definitions';
import { TypeGuard } from '../helpers';
import SymbolObservable from 'symbol-observable';

export function isStream(item: any): item is Core.Stream<unknown, unknown> {
  return (
    TypeGuard.isObject(item) &&
    TypeGuard.isFunction(item.source) &&
    TypeGuard.isFunction(item.consume)
  );
}

export function isIterable(item: any): item is Iterable<unknown> {
  return (
    TypeGuard.isObject(item) && TypeGuard.isFunction(item[Symbol.iterator])
  );
}

export function isObservableLike(item: any): item is Observables.Like<unknown> {
  return TypeGuard.isObject(item) && TypeGuard.isFunction(item.subscribe);
}

export function isObservableCompatible(
  item: any
): item is Observables.Compatible<unknown> {
  return (
    TypeGuard.isObject(item) && TypeGuard.isFunction(item[SymbolObservable])
  );
}
