import { interval } from '@push';
import assert from 'assert';

test(`succeeds wo/ arguments`, async () => {
  const obs = interval();

  let errorCalled = false;
  const values: any[] = [];
  const subscription = obs.subscribe({
    next: (value) => values.push(value),
    error: () => (errorCalled = true)
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  subscription.unsubscribe();

  assert(!errorCalled);
  assert(values[0] === 0);
});
test(`succeeds w/ every`, async () => {
  const obs = interval(100);

  let errorCalled = false;
  const values: any[] = [];
  const subscription = obs.subscribe({
    next: (value) => values.push(value),
    error: () => (errorCalled = true)
  });

  await new Promise((resolve) => setTimeout(resolve, 550));
  subscription.unsubscribe();

  assert(!errorCalled);
  assert.deepStrictEqual(values, [0, 1, 2, 3, 4]);
});
test(`succeeds w/ every, timeout (number)`, async () => {
  const obs = interval({ every: 100, timeout: 550 });

  let errorCalled = false;
  const values: any[] = [];
  const subscription = obs.subscribe({
    next: (value) => values.push(value),
    error: () => (errorCalled = true)
  });

  await new Promise((resolve) => setTimeout(resolve, 750));
  subscription.unsubscribe();

  assert(!errorCalled);
  assert.deepStrictEqual(values, [0, 1, 2, 3, 4]);
});

test(`succeeds w/ every, timeout (Promise resolution)`, async () => {
  const obs = interval({
    every: 100,
    timeout: new Promise((resolve) => setTimeout(resolve, 550))
  });

  let errorCalled = false;
  const values: any[] = [];
  const subscription = obs.subscribe({
    next: (value) => values.push(value),
    error: () => (errorCalled = true)
  });

  await new Promise((resolve) => setTimeout(resolve, 750));
  subscription.unsubscribe();

  assert(!errorCalled);
  assert.deepStrictEqual(values, [0, 1, 2, 3, 4]);
});
test(`succeeds w/ every, timeout (Promise rejection)`, async () => {
  const obs = interval({
    every: 100,
    timeout: new Promise((resolve, reject) => {
      setTimeout(() => reject(Error()), 550);
    })
  });

  let errorCalled = false;
  const values: any[] = [];
  const subscription = obs.subscribe({
    next: (value) => values.push(value),
    error: () => (errorCalled = true)
  });

  await new Promise((resolve) => setTimeout(resolve, 750));
  subscription.unsubscribe();

  assert(errorCalled);
  assert.deepStrictEqual(values, [0, 1, 2, 3, 4]);
});
