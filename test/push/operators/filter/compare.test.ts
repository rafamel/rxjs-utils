import { test } from '@jest/globals';
import assert from 'assert';
import { compare, from } from '@push';
import { into } from 'pipettes';

test(`succeeds w/ strict strategy`, () => {
  const obj = {};
  const arr = [1, 1, 2, 1, {}, {}, obj, obj, obj, 'a', 'b', 'a'];
  const obs = into(from(arr), compare());

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [
    arr[0],
    arr[2],
    arr[3],
    arr[4],
    arr[5],
    arr[6],
    arr[9],
    arr[10],
    arr[11]
  ]);
});
test(`succeeds w/ shallow strategy`, () => {
  const arr = [
    {},
    {},
    { foo: 1 },
    { foo: 1, bar: 1 },
    { foo: 1, bar: 1 },
    { foo: {} },
    { foo: {} }
  ];
  const obs = into(from(arr), compare('shallow'));

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [arr[0], arr[2], arr[3], arr[5], arr[6]]);
});
test(`succeeds w/ deep strategy`, () => {
  const arr = [
    {},
    {},
    { foo: 1 },
    { foo: 1, bar: 1 },
    { foo: 1, bar: 1 },
    { foo: {} },
    { foo: {} }
  ];
  const obs = into(from(arr), compare('deep'));

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [arr[0], arr[2], arr[3], arr[5]]);
});
test(`succeeds w/ custom compare`, () => {
  const obs = into(
    from([10, 4, 10]),
    compare<number>((a, b) => a - b !== 0)
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [10, 10]);
});
