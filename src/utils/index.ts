import { Core, Observables } from '../definitions';
import { isFunction, isObject } from '../helpers';
import SymbolObservable from 'symbol-observable';

export function isStream(item: any): item is Core.Stream<unknown, unknown> {
  return isObject(item) && isFunction(item.source) && isFunction(item.consume);
}

export function isIterable(item: any): item is Iterable<unknown> {
  return isObject(item) && isFunction(item[Symbol.iterator]);
}

export function isObservableLike(item: any): item is Observables.Like<unknown> {
  return isObject(item) && isFunction(item.subscribe);
}

export function isObservableCompatible(
  item: any
): item is Observables.Compatible<unknown> {
  return isObject(item) && isFunction(item[SymbolObservable]);
}
