import { test } from '@jest/globals';
import assert from 'assert';
import { Observable, skip } from '@push';
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
    skip(3)
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [4, 5, 6]);
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
    skip({ count: 3 })
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [4, 5, 6]);
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
    skip({ while: (x: number) => x < 3 })
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [3, 4, 5, 6, 2, 1]);
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
    skip({ while: (_: any, i) => i < 3 })
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [4, 5, 6]);
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
    skip({ count: 2, while: (x: number) => x < 5 })
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [5, 6, 2, 1]);
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
    skip({ count: 4, while: (x: number) => x < 2 })
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [5, 6, 2, 1]);
});
