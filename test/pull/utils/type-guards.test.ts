import { isIterable } from '@pull';

const noop = (): void => undefined;

test(`isIterable`, () => {
  expect(isIterable(undefined)).toBe(false);
  expect(isIterable(null)).toBe(false);
  expect(isIterable(0)).toBe(false);
  expect(isIterable(true)).toBe(false);
  expect(isIterable('')).toBe(false);
  expect(isIterable(noop)).toBe(false);
  expect(isIterable({})).toBe(false);
  expect(isIterable({ [Symbol.iterator]: {} })).toBe(false);

  expect(isIterable({ [Symbol.iterator]: noop })).toBe(true);
});
