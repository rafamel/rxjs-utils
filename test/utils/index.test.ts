import {
  isObservableLike,
  isIterable,
  isStream,
  isObservableCompatible
} from '../../src';
import 'symbol-observable';

const noop = (): void => undefined;

test(`isStream`, () => {
  expect(isStream(undefined)).toBe(false);
  expect(isStream(null)).toBe(false);
  expect(isStream(0)).toBe(false);
  expect(isStream(true)).toBe(false);
  expect(isStream('')).toBe(false);
  expect(isStream(noop)).toBe(false);
  expect(isStream({})).toBe(false);
  expect(isStream({ source: {}, consume: {} })).toBe(false);
  expect(isStream({ source: noop, consume: {} })).toBe(false);
  expect(isStream({ source: {}, consume: noop })).toBe(false);

  expect(isStream({ source: noop, consume: noop })).toBe(true);
});

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

test(`isObservableLike`, () => {
  expect(isObservableLike(undefined)).toBe(false);
  expect(isObservableLike(null)).toBe(false);
  expect(isObservableLike(0)).toBe(false);
  expect(isObservableLike(true)).toBe(false);
  expect(isObservableLike('')).toBe(false);
  expect(isObservableLike(noop)).toBe(false);
  expect(isObservableLike({})).toBe(false);
  expect(isObservableLike({ subscribe: {} })).toBe(false);

  expect(isObservableLike({ subscribe: noop })).toBe(true);
});

test(`isObservableCompatible`, () => {
  expect(isObservableCompatible(undefined)).toBe(false);
  expect(isObservableCompatible(null)).toBe(false);
  expect(isObservableCompatible(0)).toBe(false);
  expect(isObservableCompatible(true)).toBe(false);
  expect(isObservableCompatible('')).toBe(false);
  expect(isObservableCompatible(noop)).toBe(false);
  expect(isObservableCompatible({})).toBe(false);
  expect(isObservableCompatible({ [Symbol.observable]: {} })).toBe(false);

  expect(isObservableCompatible({ [Symbol.observable]: noop })).toBe(true);
});
