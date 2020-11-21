import { Observable, PushStream, delay } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(new Observable(() => undefined), delay());
  assert(obs instanceof PushStream);
});
test(`succeeds (error, 1)`, async () => {
  const error = Error('foo');
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      setTimeout(() => {
        obs.next(2);
        obs.error(error);
        obs.next(3);
      }, 95);
    }),
    delay(95)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (error, 2)`, async () => {
  const error = Error('foo');
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 45);
    }),
    delay(95)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (error, 3)`, async () => {
  const error = Error('foo');
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 180);
    }),
    delay(95)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (complete, 1)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      setTimeout(() => {
        obs.next(2);
        obs.complete();
        obs.next(3);
      }, 95);
    }),
    delay(95)
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(!complete);
  assert.deepStrictEqual(values, [1]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (complete, 2)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 45);
    }),
    delay(95)
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert(!complete);
  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (complete, 3)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 180);
    }),
    delay(95)
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(!complete);
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (unsubscribe)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => obs.next(3), 90);
      setTimeout(() => obs.next(3), 145);
    }),
    delay({ due: 95 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe({ next: (x) => values.push(x) });
  setTimeout(() => subscription.unsubscribe(), 150);

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ signals (error, 1)`, async () => {
  const error = Error('foo');
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 90);
    }),
    delay({ due: 95, signals: true })
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds w/ signals (error, 2)`, async () => {
  const error = Error('foo');
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 100);
    }),
    delay({ due: 95, signals: true })
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds w/ signals (complete, 1)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 90);
    }),
    delay({ due: 95, signals: true })
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert(!complete);
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ signals (complete, 2)`, async () => {
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 100);
    }),
    delay({ due: 95, signals: true })
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert(!complete);
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ condition`, async () => {
  let doDelay = true;
  setTimeout(() => (doDelay = false), 100);
  setTimeout(() => (doDelay = true), 200);
  setTimeout(() => (doDelay = false), 300);

  const values: [any[], any[]] = [[], []];
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(1);
      setTimeout(() => obs.next(2), 95);
      setTimeout(() => obs.next(3), 145);
      setTimeout(() => obs.next(4), 195);
      setTimeout(() => obs.next(5), 210);
      setTimeout(() => obs.next(6), 395);
    }),
    delay({
      due: 95,
      condition(x, i) {
        values[0].push([x, i]);
        return doDelay;
      }
    })
  );

  obs.subscribe({ next: (x) => values[1].push(x) });

  assert.deepStrictEqual(values, [[[1, 0]], []]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [
    [
      [1, 0],
      [2, 1]
    ],
    [1]
  ]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [
    [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3]
    ],
    [1, 2, 3, 4]
  ]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [
    [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4]
    ],
    [1, 2, 3, 4]
  ]);
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.deepStrictEqual(values, [
    [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4]
    ],
    [1, 2, 3, 4, 5]
  ]);
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.deepStrictEqual(values, [
    [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [6, 5]
    ],
    [1, 2, 3, 4, 5, 6]
  ]);
});
