import { test } from '@jest/globals';
import assert from 'assert';
import { Observable, timestamp } from '@push';
import { into } from 'pipettes';

test(`succeeds`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
    }),
    timestamp()
  );

  const before = Date.now();
  const values: any[] = [];
  obs.subscribe((x) => values.push(x));
  const after = Date.now();

  assert(typeof values[0] === 'object');
  assert(typeof values[1] === 'object');
  assert(values[0].value === 1);
  assert(values[1].value === 2);
  assert(values[0].timestamp >= before);
  assert(values[0].timestamp <= after);
  assert(values[1].timestamp >= values[0].timestamp);
  assert(values[1].timestamp <= after);
});
