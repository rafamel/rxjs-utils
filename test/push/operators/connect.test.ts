import { Observable, PushStream, connect, interval } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(new Observable(() => undefined), connect());
  assert(obs instanceof PushStream);
});
test(`succeeds wo/ replay`, async () => {
  const obs = into(interval({ every: 200, timeout: 2000 }), connect());

  const start = Date.now();
  const to = (ms: number): number => start + ms - Date.now();

  await new Promise((resolve) => setTimeout(resolve, to(700)));

  const values: any[] = [];
  let subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(1100)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(1500)));
  subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(1900)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(2300)));
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
    interval({ every: 100, timeout: 1000 }),
    connect({ replay: 1 })
  );

  const start = Date.now();
  const to = (ms: number): number => start + ms - Date.now();

  await new Promise((resolve) => setTimeout(resolve, to(350)));

  const values: any[] = [];
  let subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(550)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(750)));
  subscription = obs.subscribe((value) => values.push(value));

  await new Promise((resolve) => setTimeout(resolve, to(950)));
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, to(1150)));
  let didComplete = false;
  subscription = obs.subscribe({
    complete: () => (didComplete = true)
  });

  assert(didComplete);
  assert(subscription.closed);
  assert.deepStrictEqual(values, [2, 3, 4, 6, 7, 8]);
});
