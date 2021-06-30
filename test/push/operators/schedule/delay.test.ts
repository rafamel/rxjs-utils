import { test } from '@jest/globals';
import assert from 'assert';
import { delay, Observable } from '@push';
import { into } from 'pipettes';

test(`succeeds (error, 1)`, async () => {
  const error = Error('foo');
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      setTimeout(() => {
        obs.next(2);
        obs.error(error);
        obs.next(3);
      }, 100);
    }),
    delay(100)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (error, 2)`, async () => {
  const error = Error('foo');
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 50);
    }),
    delay(100)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (error, 3)`, async () => {
  const error = Error('foo');
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 200);
    }),
    delay(100)
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds (complete, 1)`, async () => {
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      setTimeout(() => {
        obs.next(2);
        obs.complete();
        obs.next(3);
      }, 100);
    }),
    delay(100)
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
  assert.deepStrictEqual(values, [1]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (complete, 2)`, async () => {
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 100);
    }),
    delay(100)
  );

  let complete = false;
  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    complete: () => (complete = true)
  });

  assert(!complete);
  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (complete, 3)`, async () => {
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 200);
    }),
    delay(100)
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
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds (unsubscribe)`, async () => {
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => obs.next(3), 100);
      setTimeout(() => obs.next(3), 200);
    }),
    delay({ due: 100 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe({ next: (x) => values.push(x) });
  setTimeout(() => subscription.unsubscribe(), 150);

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ signals (error, 1)`, async () => {
  const error = Error('foo');
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 100);
    }),
    delay({ due: 100, signals: true })
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds w/ signals (error, 2)`, async () => {
  const error = Error('foo');
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.error(error);
        obs.next(3);
      }, 100);
    }),
    delay({ due: 100, signals: true })
  );

  const values: any[] = [];
  obs.subscribe({
    next: (x) => values.push(x),
    error: (err) => values.push(err)
  });

  assert.deepStrictEqual(values, []);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.deepStrictEqual(values, [1, 2]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepStrictEqual(values, [1, 2, error]);
});
test(`succeeds w/ signals (complete, 1)`, async () => {
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 100);
    }),
    delay({ due: 100, signals: true })
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
    new Observable<any>((obs) => {
      obs.next(1);
      obs.next(2);
      setTimeout(() => {
        obs.complete();
        obs.next(3);
      }, 100);
    }),
    delay({ due: 100, signals: true })
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
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(complete);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ condition`, async () => {
  let doDelay = true;
  setTimeout(() => (doDelay = false), 200);
  setTimeout(() => (doDelay = true), 350);
  setTimeout(() => (doDelay = false), 550);

  const checks: Array<[any, number]> = [];
  const obs = into(
    new Observable<any>((obs) => {
      obs.next(1);
      setTimeout(() => obs.next(2), 150);
      setTimeout(() => obs.next(3), 300);
      setTimeout(() => obs.next(4), 400);
      setTimeout(() => obs.next(5), 600);
      setTimeout(() => obs.next(6), 700);
    }),
    delay({
      due: 100,
      condition(x, i) {
        checks.push([x, i]);
        return doDelay;
      }
    })
  );

  const values: any[] = [];
  obs.subscribe({ next: (x) => values.push(x) });

  const start = Date.now();
  const to = (ms: number): number => start + ms - Date.now();

  assert.deepStrictEqual(checks, [[1, 0]]);
  await new Promise((resolve) => setTimeout(resolve, to(150)));
  assert.deepStrictEqual(values, [1]);

  await new Promise((resolve) => setTimeout(resolve, to(200)));
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1]
  ]);

  await new Promise((resolve) => setTimeout(resolve, to(350)));
  assert.deepStrictEqual(values, [1, 2, 3]);
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1],
    [3, 2]
  ]);

  await new Promise((resolve) => setTimeout(resolve, to(450)));
  assert.deepStrictEqual(values, [1, 2, 3]);
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1],
    [3, 2],
    [4, 3]
  ]);

  await new Promise((resolve) => setTimeout(resolve, to(550)));
  assert.deepStrictEqual(values, [1, 2, 3, 4]);
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1],
    [3, 2],
    [4, 3]
  ]);

  await new Promise((resolve) => setTimeout(resolve, to(650)));
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 4]
  ]);

  await new Promise((resolve) => setTimeout(resolve, to(750)));
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6]);
  assert.deepStrictEqual(checks, [
    [1, 0],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 4],
    [6, 5]
  ]);
});
