import { test } from '@jest/globals';
import assert from 'assert';
import { Observable, switchMap } from '@push';
import { into } from 'pipettes';

test(`succeeds: inner error (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        obs.next(value + 1);
        obs.error(Error(String(value)));
        return () => times[1]++;
      });
    })
  );

  let error: any;
  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: (err) => {
      times[4]++;
      error = err;
    },
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert(error && error.message === '10');
  assert.deepStrictEqual(values, [10, 11]);
  assert.deepStrictEqual(times, [1, 1, 1, 2, 1, 0]);
});
test(`succeeds: inner error (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        Promise.resolve().then(() => {
          if (obs.closed) return;
          obs.next(value + 1);
          obs.error(Error(String(value)));
        });
        return () => times[1]++;
      });
    })
  );

  let error: any;
  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: (err) => {
      times[4]++;
      error = err;
    },
    complete: () => times[5]++
  });

  assert.deepStrictEqual(values, [10, 20]);
  assert.deepStrictEqual(times, [2, 1, 1, 2, 0, 0]);

  await Promise.resolve();
  assert(subscription.closed);
  assert(error && error.message === '20');
  assert.deepStrictEqual(values, [10, 20, 21]);
  assert.deepStrictEqual(times, [2, 2, 1, 3, 1, 0]);
});
test(`succeeds: outer error (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.error(Error('foo'));
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        obs.next(value + 1);
        obs.complete();
        return () => times[1]++;
      });
    })
  );

  let error: any;
  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: (err) => {
      times[4]++;
      error = err;
    },
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert(error && error.message === 'foo');
  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 2, 1, 4, 1, 0]);
});
test(`succeeds: outer error (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.error(Error('foo'));
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        Promise.resolve().then(() => {
          obs.next(value + 1);
          obs.complete();
        });
        return () => times[1]++;
      });
    })
  );

  let error: any;
  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: (err) => {
      times[4]++;
      error = err;
    },
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert(error && error.message === 'foo');
  assert.deepStrictEqual(values, [10, 20]);
  assert.deepStrictEqual(times, [2, 2, 1, 2, 1, 0]);
});
test(`succeeds: complete (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        obs.next(value + 1);
        obs.complete();
        return () => times[1]++;
      });
    })
  );

  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 2, 1, 4, 0, 1]);
});
test(`succeeds: complete (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        obs.next(value + 1);
        Promise.resolve().then(() => {
          obs.next(value + 2);
          obs.next(value + 3);
          obs.complete();
        });
        return () => times[1]++;
      });
    })
  );

  const values: any[] = [];
  const subscription = obs.subscribe({
    start: () => times[2]++,
    next: (value) => {
      times[3]++;
      values.push(value);
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 1, 1, 4, 0, 0]);

  await Promise.resolve();
  assert(subscription.closed);
  assert.deepStrictEqual(values, [10, 11, 20, 21, 22, 23]);
  assert.deepStrictEqual(times, [2, 2, 1, 6, 0, 1]);
});
test(`succeeds: unsubscribe`, () => {
  const times = [0, 0, 0, 0, 0, 0];
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    switchMap((value: number) => {
      return new Observable<number>((obs) => {
        times[0]++;
        obs.next(value);
        obs.next(value + 1);
        obs.complete();
        return () => times[1]++;
      });
    })
  );

  let subscription: any;
  const values: any[] = [];
  obs.subscribe({
    start: (subs) => {
      times[2]++;
      subscription = subs;
    },
    next: (value) => {
      times[3]++;
      values.push(value);
      subscription.unsubscribe();
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(subscription && subscription.closed);
  assert.deepStrictEqual(values, [10]);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
});
