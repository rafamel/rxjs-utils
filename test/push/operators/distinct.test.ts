import { Observable, PushStream, distinct } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(new Observable(() => undefined), distinct());
  assert(obs instanceof PushStream);
});
test(`succeeds w/ default selector`, () => {
  const arr = [1, {}, 'b', {}];
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(arr[0]);
      obs.next(arr[1]);
      obs.next(arr[1]);
      obs.next(arr[2]);
      obs.next(arr[3]);
      obs.next(arr[1]);
      obs.next(arr[3]);
      obs.next(arr[0]);
    }),
    distinct()
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, arr);
});
test(`succeeds w/ custom selector (1)`, () => {
  const arr = [1, {}, 'b', {}];
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(arr[0]);
      obs.next(arr[1]);
      obs.next(arr[1]);
      obs.next(arr[2]);
      obs.next(arr[3]);
      obs.next(arr[1]);
      obs.next(arr[3]);
      obs.next(arr[0]);
    }),
    distinct((x, i) => String(x) + String(i))
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [
    arr[0],
    arr[1],
    arr[1],
    arr[2],
    arr[3],
    arr[1],
    arr[3],
    arr[0]
  ]);
});
test(`succeeds w/ custom selector (2)`, () => {
  const arr = [1, {}, 'b', {}];
  const obs = into(
    new PushStream<any>((obs) => {
      obs.next(arr[0]);
      obs.next(arr[1]);
      obs.next(arr[1]);
      obs.next(arr[2]);
      obs.next(arr[3]);
      obs.next(arr[1]);
      obs.next(arr[3]);
      obs.next(arr[0]);
    }),
    distinct((x) => String(x))
  );

  const values: any[] = [];
  obs.subscribe((x) => values.push(x));

  assert.deepStrictEqual(values, [arr[0], arr[1], arr[2]]);
});
