import { PushStream, of } from '@push';
import assert from 'assert';

test(`succeeds`, () => {
  const values: any[] = [];
  const stream = of(1, 2, 3, 4, 5, 6);
  stream.subscribe((value) => values.push(value));

  assert(stream instanceof PushStream);
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6]);
});
