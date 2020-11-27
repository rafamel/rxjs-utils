import { merge, Observable } from '@push';
import assert from 'assert';

test(`throws for < 1 arguments`, () => {
  let pass = false;

  try {
    (merge as any)();
  } catch (_) {
    pass = true;
  }

  assert(pass);
});
test(`succeeds for 1 argument`, () => {
  merge(new Observable(() => undefined));
});
test(`succeeds, error early termination`, async () => {
  const error = Error();

  const a = new Observable((obs) => {
    obs.next(1);
    obs.next(2);
    Promise.resolve().then(() => {
      obs.next(7);
      obs.next(8);
      obs.complete();
    });
  });

  const b = new Observable((obs) => {
    obs.next(3);
    obs.next(4);
    Promise.resolve().then(() => {
      obs.next(9);
      obs.next(10);
      obs.error(error);
    });
  });

  const c = new Observable((obs) => {
    obs.next(5);
    obs.next(6);
    Promise.resolve().then(() => {
      obs.next(11);
      obs.next(12);
    });
  });

  const times = [0, 0];
  const values: any[] = [];
  let res: any;
  const subscription = merge(a, b, c).subscribe({
    start: () => times[0]++,
    next: (x) => values.push(x),
    error: (err) => (res = err),
    complete: () => times[1]++
  });

  await Promise.resolve();
  assert(res === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 0]);
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
test(`succeeds, complete termination`, async () => {
  const a = new Observable((obs) => {
    obs.next(1);
    obs.next(2);
    Promise.resolve().then(() => {
      obs.next(7);
      obs.next(8);
      obs.complete();
    });
  });

  const b = new Observable((obs) => {
    obs.next(3);
    obs.next(4);
    Promise.resolve().then(() => {
      obs.next(9);
      obs.next(10);
      obs.complete();
    });
  });

  const c = new Observable((obs) => {
    obs.next(5);
    obs.next(6);
    Promise.resolve().then(() => {
      obs.next(11);
      obs.next(12);
      obs.complete();
    });
  });

  const times = [0, 0, 0];
  const values: any[] = [];
  const subscription = merge(a, b, c).subscribe({
    start: () => times[0]++,
    next: (x) => values.push(x),
    error: () => times[1]++,
    complete: () => times[2]++
  });

  await Promise.resolve();
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 0, 1]);
  assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});
test(`doesn't subscribe to next observables if destination is already closed`, () => {
  const a = new Observable((obs) => {
    obs.next(1);
    obs.next(2);
    obs.error(Error());
  });

  let subscribed = false;
  const b = new Observable(() => {
    subscribed = true;
  });

  const times = [0, 0, 0];
  const values: any[] = [];
  const subscription = merge(a, b).subscribe({
    start: () => times[0]++,
    next: (x) => values.push(x),
    error: () => times[1]++,
    complete: () => times[2]++
  });

  assert(!subscribed);
  assert(subscription.closed);
  assert.deepStrictEqual(values, [1, 2]);
  assert.deepStrictEqual(times, [1, 1, 0]);
});
