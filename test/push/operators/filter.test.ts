import { Observable, PushStream, filter } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(
    new Observable(() => undefined),
    filter(() => true)
  );
  assert(obs instanceof PushStream);
});
test(`succeeds`, () => {
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
      obs.next(4);
    }),
    filter((x: number, i) => typeof x === 'number' && i !== 2)
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [1, 2, 4]);
});
