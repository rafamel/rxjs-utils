import { TypeGuard } from '@helpers';

export function isIterable(item: any): item is Iterable<unknown> {
  return TypeGuard.isIterable(item);
}
