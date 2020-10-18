import { Observables } from '../definitions';
import SymbolObservable from 'symbol-observable';
import { isFunction, isObject } from '../helpers';

export function isObservableLike(item: any): item is Observables.Like<unknown> {
  return isObject(item) && isFunction(item.subscribe);
}

export function isObservableCompatible(
  item: any
): item is Observables.Compatible<unknown> {
  return isObject(item) && isFunction(item[SymbolObservable]);
}

export function isIterable(item: any): item is Iterable<unknown> {
  return isObject(item) && isFunction(item[Symbol.iterator]);
}
