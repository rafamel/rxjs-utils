import { Observables } from '@definitions';
import { TypeGuard } from '@helpers';
import 'symbol-observable';

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
    TypeGuard.isObject(item) && TypeGuard.isFunction(item[Symbol.observable])
  );
}
