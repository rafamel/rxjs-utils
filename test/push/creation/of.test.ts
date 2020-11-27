import { Observable, of } from '@push';
import assert from 'assert';

test(`succeeds`, () => {
  const values: any[] = [];
  const observable = of(1, 2, 3, 4, 5, 6);
  observable.subscribe((value) => values.push(value));

  assert(observable instanceof Observable);
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6]);
});
