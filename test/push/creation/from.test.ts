import { PushStream, from, Observable, PushableStream } from '@push';
import assert from 'assert';
import 'symbol-observable';

test(`succeeds w/ PushStream`, () => {
  const stream = new PushStream(() => undefined);

  assert(from(stream) === stream);
});
test(`succeeds w/ PushableStream`, () => {
  const pushable = new PushableStream();
  const stream = from(pushable);

  assert(stream !== pushable);
  assert(stream instanceof PushStream);
  assert(!(stream instanceof PushableStream));

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  pushable.next(1);
  pushable.next(2);
  pushable.complete();

  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ Observable`, () => {
  const stream = from(
    new Observable((obs) => {
      obs.next(1);
      obs.next(2);
      obs.complete();
    })
  );

  assert(stream instanceof PushStream);

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ Compatible`, () => {
  const obs = new Observable((obs) => {
    obs.next(1);
    obs.next(2);
    obs.complete();
  });
  const stream = from({
    [Symbol.observable]() {
      return obs;
    }
  });

  assert(stream instanceof PushStream);

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`fails w/ invalid Compatible`, () => {
  let error: any;
  try {
    from({ [Symbol.observable]: () => null as any });
  } catch (err) {
    error = err;
  }

  assert(error);
  assert(error instanceof TypeError);
});
test(`succeeds w/ Like`, () => {
  const obs = new Observable((obs) => {
    obs.next(1);
    obs.next(2);
    obs.complete();
  });

  const stream = from({
    subscribe(...arr: any[]) {
      return obs.subscribe(...arr);
    }
  });

  assert(stream instanceof PushStream);

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ Iterable`, () => {
  const stream = from([1, 2]);

  assert(stream instanceof PushStream);

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  assert.deepStrictEqual(values, [1, 2]);
});
test(`succeeds w/ Promise resolution`, async () => {
  const stream = from(Promise.resolve(1));

  assert(stream instanceof PushStream);

  const values: any[] = [];
  stream.subscribe((value) => values.push(value));
  await Promise.resolve();
  assert.deepStrictEqual(values, [1]);
});
test(`succeeds w/ Promise rejection`, async () => {
  const error = Error('foo');
  const stream = from(Promise.reject(error));

  assert(stream instanceof PushStream);

  const values: any[] = [];
  let err: any;
  stream.subscribe({
    next: (value) => values.push(value),
    error: (error) => (err = error)
  });

  await Promise.resolve();
  assert(error === err);
  assert.deepStrictEqual(values, []);
});
