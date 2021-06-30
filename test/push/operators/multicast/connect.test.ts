import { test, expect } from '@jest/globals';
import assert from 'assert';
import { connect, interval, Multicast } from '@push';
import { into } from 'pipettes';

test(`returns Multicast`, () => {
  const obs = into(interval({ every: 10, cancel: (i) => i >= 8 }), connect());
  expect(obs).toBeInstanceOf(Multicast);
});
test(`succeeds wo/ replay`, async () => {
  const obs = into(interval({ every: 300, cancel: (i) => i >= 8 }), connect());

  const start = Date.now();
  const to = (ms: number): number => start + ms - Date.now();

  await new Promise((resolve) => setTimeout(resolve, to(1050)));

  const values: any[] = [];
  let subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(1650)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(2250)));
  subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(2850)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(3450)));

  let didComplete = false;
  subscription = obs.subscribe({
    complete: () => (didComplete = true)
  });

  assert(didComplete);
  assert(subscription.closed);
  assert.deepStrictEqual(values, [3, 4, 7, 8]);
});
test(`succeeds w/ replay`, async () => {
  const obs = into(
    interval({ every: 300, cancel: (i) => i >= 8 }),
    connect({ replay: 1 })
  );

  const start = Date.now();
  const to = (ms: number): number => start + ms - Date.now();

  await new Promise((resolve) => setTimeout(resolve, to(1050)));

  const values: any[] = [];
  let subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(1650)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(2250)));
  subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(2850)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(3450)));
  let didComplete = false;
  subscription = obs.subscribe({
    complete: () => (didComplete = true)
  });

  assert(didComplete);
  assert(subscription.closed);
  assert.deepStrictEqual(values, [2, 3, 4, 6, 7, 8]);
});
