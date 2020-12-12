import { Pull } from '@definitions';
import { TypeGuard } from 'type-core';

export function isPullableConvertible(
  item: any
): item is Pull.Convertible<unknown, unknown> {
  return (
    isPullableLike(item) ||
    isPullableCompatible(item) ||
    TypeGuard.isIterable(item)
  );
}

export function isPullableLike(item: any): item is Pull.Like<unknown, unknown> {
  return TypeGuard.isObject(item) && TypeGuard.isFunction(item.source);
}

export function isPullableCompatible(
  item: any
): item is Pull.Compatible<unknown, unknown> {
  return TypeGuard.isAsyncIterable(item);
}
