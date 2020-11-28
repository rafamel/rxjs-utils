import { TypeGuard } from 'type-core';

export function isIterable(item: any): item is Iterable<unknown> {
  return TypeGuard.isIterable(item);
}
