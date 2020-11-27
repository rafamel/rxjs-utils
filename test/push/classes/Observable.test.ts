import {
  Observable,
  isObservableCompatible,
  isObservableLike,
  Subscription
} from '@push';
import { Handler } from '@helpers';
import assert from 'assert';

Observable.configure();

test(`Observable is ObservableLike`, () => {
  const instance = new Observable(() => undefined);
  assert(isObservableLike(instance));
});
test(`Observable is ObservableCompatible`, () => {
  const instance = new Observable(() => undefined);
  assert(isObservableCompatible(instance));

  const observable = instance[Symbol.observable]();
  assert(observable instanceof Observable);
});
test(`Subscribe: errors when Observer is not empty, a function or an object`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const instance: any = new Observable(() => undefined);

  instance.subscribe(0);
  assert(errors.length === 1);
  instance.subscribe(false);
  assert((errors.length as number) === 2);
  instance.subscribe('');
  assert((errors.length as number) === 3);
});
test(`Subscribe: Doesn't error when Observer is empty, a function or an object`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const instance = new Observable(() => undefined);

  const subscriptions = [
    instance.subscribe(),
    instance.subscribe(null),
    instance.subscribe(undefined),
    instance.subscribe(() => undefined),
    instance.subscribe({})
  ];

  subscriptions.map((subscription) => subscription.unsubscribe());

  assert(!errors.length);
});
test(`Subscription.unsubscribe: errors when subscriber fails`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  new Observable(() => () => Handler.throws(Error())).subscribe().unsubscribe();

  assert(errors.length);
});
test(`Subscription.unsubscribe: doesn't error when subscriber succeeds`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  new Observable(() => () => undefined).subscribe().unsubscribe();

  assert(!errors.length);
});
test(`Observer.start: errors when it fails`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0];
  const error = Error('foo');
  const subscription = new Observable(() => {
    times[0]++;
  }).subscribe({
    start: () => {
      times[1]++;
      throw error;
    }
  });

  assert(errors[0] === error);
  assert(!subscription.closed);
  assert.deepStrictEqual(times, [1, 1]);
});
test(`Observer.start: hooks properly unsubscribe on error`, () => {
  Observable.configure({
    onUnhandledError: (_, subscription) => subscription.unsubscribe()
  });

  const times = [0, 0];
  const subscription = new Observable(() => {
    times[0]++;
  }).subscribe({
    start: () => {
      times[1]++;
      throw Error();
    }
  });

  assert(subscription.closed);
  assert.deepStrictEqual(times, [0, 1]);
});
test(`Observer.start: doesn't error when it succeeds`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0];
  new Observable(() => {
    times[0]++;
  })
    .subscribe({ start: () => times[1]++ })
    .unsubscribe();

  assert(!errors.length);
  assert.deepStrictEqual(times, [1, 1]);
});
test(`Observer.start: receives a subscription`, () => {
  let pass = false;

  new Observable(() => undefined)
    .subscribe({
      start: (subscription) => {
        pass = subscription instanceof Subscription;
      }
    })
    .unsubscribe();

  assert(pass);
});
test(`Observer.next: hooks properly unsubscribe on error (sync)`, () => {
  Observable.configure({
    onUnhandledError: (_, subscription) => subscription.unsubscribe()
  });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    times[0]++;
    obs.next();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => {
      times[3]++;
      throw Error();
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
});
test(`Observer.next: hooks properly unsubscribe on error (async)`, async () => {
  Observable.configure({
    onUnhandledError: (_, subscription) => subscription.unsubscribe()
  });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    times[0]++;
    Promise.resolve().then(() => obs.next());
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => {
      times[3]++;
      throw Error();
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert.deepStrictEqual(times, [1, 0, 1, 0, 0, 0]);

  await Promise.resolve();
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
});
test(`Observer.next: errors when it fails (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    times[0]++;
    obs.next();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => {
      times[3]++;
      throw error;
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(errors[0] === error);
  assert(!subscription.closed);
  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);
});
test(`Observer.next: errors when it fails (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    Promise.resolve().then(() => obs.next());
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => {
      times[3]++;
      throw Error();
    },
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(!errors.length);
  assert.deepStrictEqual(times, [1, 0, 1, 0, 0, 0]);
  await Promise.resolve();
  assert(errors.length);
  assert(!subscription.closed);
  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);
});
test(`Observer.next: doesn't error when it succeeds (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    times[0]++;
    obs.next();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(!subscription.closed);
  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);

  subscription.unsubscribe();
  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
});
test(`Observer.next: doesn't error when it succeeds (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable<void>((obs) => {
    Promise.resolve().then(() => obs.next());
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  await Promise.resolve();
  assert(!subscription.closed);
  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);

  subscription.unsubscribe();
  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
});
test(`Observer.error: errors when it fails (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.error(error);
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: (err) => {
      times[4]++;
      throw err;
    },
    complete: () => times[5]++
  });

  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
});
test(`Observer.error: errors when it fails (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0, 0];

  const subscription = new Observable((obs) => {
    Promise.resolve().then(() => obs.error(Error()));
    times[0]++;
    return () => {
      times[1]++;
      throw Error();
    };
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => {
      times[4]++;
      throw error;
    },
    complete: () => times[5]++
  });

  await Promise.resolve();
  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
});
test(`Observer.error: errors after it's closed (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const values = [Error('foo'), Error('bar'), Error('baz')];
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.error(Error());
    obs.error(values[0]);
    obs.error(values[1]);
    obs.error(values[2]);
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  assert.deepStrictEqual(errors, values);
});
test(`Observer.error: errors after it's closed (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const values = [Error('foo'), Error('bar'), Error('baz')];
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.error(Error());
    Promise.resolve().then(() => {
      obs.error(values[0]);
      obs.error(values[1]);
      obs.error(values[2]);
    });
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  await Promise.resolve();
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  assert.deepStrictEqual(errors, values);
});
test(`Observer.error: errors when there's no listener (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.error(error);
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    complete: () => times[4]++
  });

  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0]);
});
test(`Observer.error: errors when there's no listener (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    Promise.resolve().then(() => obs.error(error));
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    complete: () => times[4]++
  });

  await Promise.resolve();
  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0]);
});
test(`Observer.error: doesn't error when it succeeds and there's a listener (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.error(Error());
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
});
test(`Observer.error: doesn't error when it succeeds and there's a listener (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];

  const subscription = new Observable((obs) => {
    Promise.resolve().then(() => obs.error(Error()));
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  await Promise.resolve();
  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
});
test(`Observer.error: catches Subscriber error`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  let res: any;
  const error = Error('foo');
  const times = [0, 0, 0, 0, 0];

  const subscription = new Observable(() => {
    times[0]++;
    throw error;
  }).subscribe({
    start: () => times[1]++,
    next: () => times[2]++,
    error: (err) => {
      times[3]++;
      res = err;
    },
    complete: () => times[4]++
  });

  assert(res === error);
  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 0, 1, 0]);
});
test(`Observer.error: catches Subscriber error and errors on failure`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0];
  const subscription = new Observable(() => {
    times[0]++;
    throw error;
  }).subscribe({
    start: () => times[1]++,
    next: () => times[2]++,
    error: (err) => {
      times[3]++;
      throw err;
    },
    complete: () => times[4]++
  });

  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 0, 1, 0]);
});
test(`Observer.error: catches Subscriber errors and errors when lacking listener`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0];
  const subscription = new Observable(() => {
    times[0]++;
    throw error;
  }).subscribe({
    start: () => times[1]++,
    next: () => times[2]++,
    complete: () => times[3]++
  });

  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 0, 0]);
});
test(`Observer.complete: rejects when it fails (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.complete();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => {
      times[5]++;
      throw error;
    }
  });

  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
});
test(`Observer.complete: errors when it fails (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const error = Error('foo');
  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    Promise.resolve().then(() => obs.complete());
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => {
      times[5]++;
      throw error;
    }
  });

  await Promise.resolve();
  assert(errors[0] === error);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
});
test(`Observer.complete: doesn't error when it succeeds (sync)`, () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    obs.complete();
    obs.complete();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
});
test(`Observer.complete: doesn't error when it succeeds (async)`, async () => {
  const errors: Error[] = [];
  Observable.configure({ onUnhandledError: (err) => errors.push(err) });

  const times = [0, 0, 0, 0, 0, 0];
  const subscription = new Observable((obs) => {
    times[0]++;
    Promise.resolve().then(() => {
      obs.complete();
      obs.complete();
    });
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++
  });

  await Promise.resolve();
  assert(!errors.length);
  assert(subscription.closed);
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
});
