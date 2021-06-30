import { test } from '@jest/globals';
import assert from 'assert';
import { Observable, take } from '@push';
import { into } from 'pipettes';

test(`succeeds w/ count (1)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
    }),
    take(3)
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2, 3]);
});
test(`succeeds w/ count (2)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
    }),
    take({ count: 3 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2, 3]);
});
test(`succeeds w/ while (value)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
      obs.next(2);
      obs.next(1);
    }),
    take({ while: (x: number) => x < 3 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ while (index)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
    }),
    take({ while: (_: any, i) => i < 3 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2, 3]);
});
test(`succeeds w/ count + while (1)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
      obs.next(2);
      obs.next(1);
    }),
    take({ count: 2, while: (x: number) => x < 5 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2, 3, 4]);
});
test(`succeeds w/ count + while (2)`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
      obs.next(2);
      obs.next(1);
    }),
    take({ count: 4, while: (x: number) => x < 2 })
  );

  const values: any[] = [];
  const subscription = obs.subscribe((x) => values.push(x));

  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2, 3, 4]);
});
