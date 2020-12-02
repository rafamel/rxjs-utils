import { interval, Multicast, Observable, share } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns Multicast`, () => {
  const obs = into(interval({ every: 10, cancel: (i) => i >= 8 }), share());
  expect(obs).toBeInstanceOf(Multicast);
});
test(`succeeds w/ on-demand policy`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable((obs) => {
      times[0]++;
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.next(3);
        obs.complete();
      }, 100);
      return () => times[1]++;
    }),
    share()
  );

  assert.deepStrictEqual(times, [0, 0, 0, 0, 0, 0]);

  obs
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    })
    .unsubscribe();

  assert.deepStrictEqual(times, [1, 1, 1, 2, 0, 0]);

  const a = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [2, 1, 2, 4, 0, 0]);

  const b = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [2, 1, 3, 4, 0, 0]);
  a.unsubscribe();
  assert.deepStrictEqual(times, [2, 1, 3, 4, 0, 0]);

  const c = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [2, 1, 4, 4, 0, 0]);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(times, [2, 2, 4, 6, 0, 2]);

  b.unsubscribe();
  c.unsubscribe();
  assert.deepStrictEqual(times, [2, 2, 4, 6, 0, 2]);

  obs
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    })
    .unsubscribe();

  assert.deepStrictEqual(times, [2, 2, 5, 6, 0, 3]);
});
test(`succeeds w/ keep-open policy`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable((obs) => {
      times[0]++;
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.next(3);
        obs.complete();
      }, 100);
      return () => times[1]++;
    }),
    share('keep-open')
  );

  assert.deepStrictEqual(times, [0, 0, 0, 0, 0, 0]);

  obs
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    })
    .unsubscribe();

  assert.deepStrictEqual(times, [1, 0, 1, 2, 0, 0]);

  const a = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 2, 2, 0, 0]);

  const b = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 3, 2, 0, 0]);
  a.unsubscribe();
  assert.deepStrictEqual(times, [1, 0, 3, 2, 0, 0]);

  const c = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 4, 2, 0, 0]);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(times, [1, 1, 4, 4, 0, 2]);

  b.unsubscribe();
  c.unsubscribe();
  assert.deepStrictEqual(times, [1, 1, 4, 4, 0, 2]);

  obs
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    })
    .unsubscribe();

  assert.deepStrictEqual(times, [1, 1, 5, 4, 0, 3]);
});
test(`succeeds w/ keep-closed policy wo/ finalization`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable((obs) => {
      times[0]++;
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.next(3);
        obs.complete();
      }, 100);
      return () => times[1]++;
    }),
    share('keep-closed')
  );

  assert.deepStrictEqual(times, [0, 0, 0, 0, 0, 0]);

  const a = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 1, 2, 0, 0]);

  const b = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 2, 2, 0, 0]);
  a.unsubscribe();
  assert.deepStrictEqual(times, [1, 0, 2, 2, 0, 0]);

  const c = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 3, 2, 0, 0]);
  b.unsubscribe();
  c.unsubscribe();
  assert.deepStrictEqual(times, [1, 1, 3, 2, 0, 0]);

  const d = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 1, 4, 2, 1, 0]);
  d.unsubscribe();
  assert.deepStrictEqual(times, [1, 1, 4, 2, 1, 0]);
});
test(`succeeds w/ keep-closed policy w/ finalization`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable((obs) => {
      times[0]++;
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.next(3);
        obs.complete();
      }, 100);
      return () => times[1]++;
    }),
    share({ policy: 'keep-closed' })
  );

  assert.deepStrictEqual(times, [0, 0, 0, 0, 0, 0]);

  const a = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 1, 2, 0, 0]);

  const b = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 2, 2, 0, 0]);
  a.unsubscribe();
  assert.deepStrictEqual(times, [1, 0, 2, 2, 0, 0]);

  const c = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 3, 2, 0, 0]);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(times, [1, 1, 3, 4, 0, 2]);

  b.unsubscribe();
  c.unsubscribe();
  assert.deepStrictEqual(times, [1, 1, 3, 4, 0, 2]);

  const d = obs.subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 1, 4, 4, 0, 3]);
  d.unsubscribe();
  assert.deepStrictEqual(times, [1, 1, 4, 4, 0, 3]);
});
