import { TypeGuard } from '@helpers';
import assert from 'assert';

test(`TypeGuard.isFunction`, () => {
  assert(!TypeGuard.isFunction(undefined));
  assert(!TypeGuard.isFunction(null));
  assert(!TypeGuard.isFunction(0));
  assert(!TypeGuard.isFunction(false));
  assert(!TypeGuard.isFunction(''));
  assert(!TypeGuard.isFunction({}));
  assert(TypeGuard.isFunction(() => undefined));
});
test(`TypeGuard.isObject`, () => {
  assert(!TypeGuard.isObject(undefined));
  assert(!TypeGuard.isObject(null));
  assert(!TypeGuard.isObject(0));
  assert(!TypeGuard.isObject(false));
  assert(!TypeGuard.isObject(''));
  assert(!TypeGuard.isObject(() => undefined));
  assert(TypeGuard.isObject({}));
});
test(`TypeGuard.isEmpty`, () => {
  assert(!TypeGuard.isEmpty(0));
  assert(!TypeGuard.isEmpty(false));
  assert(!TypeGuard.isEmpty(''));
  assert(!TypeGuard.isEmpty(() => undefined));
  assert(!TypeGuard.isEmpty({}));
  assert(TypeGuard.isEmpty(undefined));
  assert(TypeGuard.isEmpty(null));
});
