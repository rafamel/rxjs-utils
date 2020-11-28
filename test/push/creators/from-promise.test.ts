import { Observable, fromPromise } from '@push';
import assert from 'assert';

test(`succeeds w/ Promise resolution`, async () => {
  const observable = fromPromise(Promise.resolve(1));

  assert(observable instanceof Observable);

  const values: any[] = [];
  observable.subscribe((value) => values.push(value));
  await Promise.resolve();
  assert.deepStrictEqual(values, [1]);
});
test(`succeeds w/ Promise rejection`, async () => {
  const error = Error('foo');
  const observable = fromPromise(Promise.reject(error));

  assert(observable instanceof Observable);

  const values: any[] = [];
  let err: any;
  observable.subscribe({
    next: (value) => values.push(value),
    error: (error) => (err = error)
  });

  await Promise.resolve();
  assert(error === err);
  assert.deepStrictEqual(values, []);
});
