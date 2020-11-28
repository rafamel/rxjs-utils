import { Observable, group } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`succeeds w/ default`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
    }),
    group()
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [
    [1, 2],
    [3, 4]
  ]);
});
test(`succeeds w/ custom`, () => {
  const obs = into(
    new Observable<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
      obs.next(5);
      obs.next(6);
      obs.next(7);
    }),
    group(3)
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [
    [1, 2, 3],
    [4, 5, 6]
  ]);
});
