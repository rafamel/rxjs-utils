import SymbolObservable from 'symbol-observable';
import { Observable } from '@definitions';
import { Stream } from '../stream';

export function isStream(item: any): item is Stream<unknown> {
  return item instanceof Stream;
}

export function isObservable(item: any): item is Observable<unknown> {
  const typeofItem = typeof item;
  return (
    ((typeofItem === 'object' && item !== null) || typeofItem === 'function') &&
    (typeof item[SymbolObservable] === 'function' ||
      typeof item['@@observable'] === 'function') &&
    typeof item.subscribe === 'function'
  );
}

export function isIterable(item: any): item is Iterable<unknown> {
  const typeofItem = typeof item;
  return (
    ((typeofItem === 'object' && item !== null) || typeofItem === 'function') &&
    typeof item[Symbol.iterator] === 'function'
  );
}

export function isAsyncIterable(item: any): item is AsyncIterable<unknown> {
  const typeofItem = typeof item;
  return (
    ((typeofItem === 'object' && item !== null) || typeofItem === 'function') &&
    typeof item[Symbol.asyncIterator] === 'function'
  );
}
