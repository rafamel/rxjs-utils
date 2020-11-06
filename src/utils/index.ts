import { Core, Observables } from '../definitions';
import { IdentityGuard } from '../helpers';
import SymbolObservable from 'symbol-observable';

export function isStream(item: any): item is Core.Stream<unknown, unknown> {
  return (
    IdentityGuard.isObject(item) &&
    IdentityGuard.isFunction(item.source) &&
    IdentityGuard.isFunction(item.consume)
  );
}

export function isIterable(item: any): item is Iterable<unknown> {
  return (
    IdentityGuard.isObject(item) &&
    IdentityGuard.isFunction(item[Symbol.iterator])
  );
}

export function isObservableLike(item: any): item is Observables.Like<unknown> {
  return (
    IdentityGuard.isObject(item) && IdentityGuard.isFunction(item.subscribe)
  );
}

export function isObservableCompatible(
  item: any
): item is Observables.Compatible<unknown> {
  return (
    IdentityGuard.isObject(item) &&
    IdentityGuard.isFunction(item[SymbolObservable])
  );
}
