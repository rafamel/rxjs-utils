import { Observable, PushStream, mergeMap } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(
    new Observable(() => undefined),
    mergeMap(() => new Observable(() => undefined))
  );
  assert(obs instanceof PushStream);
});
test(`succeeds: inner error (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert(subscription.closed);
  assert(error && error.message === '10');
  assert.deepStrictEqual(values, [10, 11]);
  assert.deepStrictEqual(times, [1, 1, 1, 2, 1, 0, 1]);
});
test(`succeeds: inner error (async)`, async () => {
  let error: any;
  const values: any[] = [];
  const times = [0, 0, 0, 0, 0, 0, 0];

  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
        times[0]++;
        obs.next(value);
        Promise.resolve().then(() => {
          obs.next(value + 1);
          if (!error) obs.error(Error(String(value)));
        });
        return () => times[1]++;
      });
    })
  );

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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert.deepStrictEqual(values, [10, 20]);
  assert.deepStrictEqual(times, [2, 0, 1, 2, 0, 0, 0]);
  await Promise.resolve();
  assert(subscription.closed);
  assert(error && error.message === '10');
  assert.deepStrictEqual(values, [10, 20, 11]);
  assert.deepStrictEqual(times, [2, 2, 1, 3, 1, 0, 1]);
});
test(`succeeds: outer error (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.error(Error('foo'));
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert(subscription.closed);
  assert(error && error.message === 'foo');
  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 2, 1, 4, 1, 0, 1]);
});
test(`succeeds: outer error (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.error(Error('foo'));
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert(subscription.closed);
  assert(error && error.message === 'foo');
  assert.deepStrictEqual(values, [10, 20]);
  assert.deepStrictEqual(times, [2, 2, 1, 2, 1, 0, 1]);
});
test(`succeeds: complete (sync)`, () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert(subscription.closed);
  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 2, 1, 4, 0, 1, 1]);
});
test(`succeeds: complete (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert.deepStrictEqual(values, [10, 11, 20, 21]);
  assert.deepStrictEqual(times, [2, 0, 1, 4, 0, 0, 0]);

  await Promise.resolve();
  assert(subscription.closed);
  assert.deepStrictEqual(values, [10, 11, 20, 21, 12, 13, 22, 23]);
  assert.deepStrictEqual(times, [2, 2, 1, 8, 0, 1, 1]);
});
test(`succeeds: unsubscribe`, () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(10);
      obs.next(20);
      obs.complete();
    }),
    mergeMap((value: number) => {
      return new PushStream<number>((obs) => {
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
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert(subscription && subscription.closed);
  assert.deepStrictEqual(values, [10]);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0, 1]);
});
