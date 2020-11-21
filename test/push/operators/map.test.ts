import { Observable, PushStream, map } from '@push';
import { Handler } from '@helpers';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(new Observable(() => undefined), map(Handler.noop));
  assert(obs instanceof PushStream);
});
test(`succeeds`, () => {
  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
    }),
    map((x: number, i) => [x, i])
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [
    [1, 0],
    [2, 1],
    [3, 2]
  ]);
});
