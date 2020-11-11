import assert from 'assert';
import { PushStream, Stream } from '../../src';
import compliance from '../es-observable/compliance';

describe(`Primary`, () => {
  test(`Complies with Observable spec`, async () => {
    const response = await compliance('PushStream', PushStream, 'silent');
    assert(response.result[1].length === 0);
  });
  test(`PushStream is Stream`, () => {
    const instance = new PushStream(() => undefined);
    assert(instance instanceof Stream);
  });
  test(`ObserverTalkback can't be manually started/terminated`, () => {
    let obs: any;
    new PushStream((_) => {
      obs = _;
    }).subscribe();

    assert(!obs.start);
    assert(!obs.terminate);
  });
});
describe(`PushStream.from`, () => {
  test(`creates from Like`, () => {
    const instance = new PushStream((obs) => obs.next('foo'));
    const obs = { subscribe: instance.subscribe.bind(instance) };

    let response: any;
    PushStream.from(obs).subscribe((value) => (response = value));

    assert(response === 'foo');
  });
});
describe(`PushStream.prototype.subscribe: Subscription is a promise`, () => {
  test(`has then, catch, finally, methods`, () => {
    const subscription = new PushStream(() => undefined).subscribe();

    assert(typeof subscription.then === 'function');
    assert(typeof subscription.catch === 'function');
    assert(typeof subscription.finally === 'function');
    assert(subscription.then.length === 2);
    assert(subscription.catch.length === 1);
    assert(subscription.finally.length === 1);
  });
  test(`has Symbol.toStringTag property`, () => {
    const subscription = new PushStream(() => undefined).subscribe();
    assert(typeof subscription[Symbol.toStringTag] === 'string');
  });
  test(`catch calls then`, async () => {
    const subscription = new PushStream(() => undefined).subscribe();

    const values: any[] = [];
    subscription.then = (a, b): any => {
      values.push(a, b);
      return 'bar';
    };

    const res = await subscription.catch('foo' as any);

    assert(res === ('bar' as any));
    assert.deepStrictEqual(values, [undefined, 'foo']);
  });
  test(`finally calls then, calls finalization function`, async () => {
    const values: any[] = [];
    const subscription: any = new PushStream(() => undefined).subscribe();

    subscription.then = (a: any, b: any) => Promise.resolve('foo').then(a, b);

    const a = await subscription.finally();
    assert(a === 'foo');

    const b = await subscription.finally((value: any) => {
      values.push(value);
    });
    assert(b === 'foo');
    assert.deepStrictEqual(values, [undefined]);

    // eslint-disable-next-line
    subscription.then = (a: any, b: any) => Promise.reject('bar').then(a, b);

    const c = await subscription
      .finally((value: any) => {
        values.push(value);
      })
      .catch((value: any) => value + 'baz');
    assert(c === 'barbaz');
    assert.deepStrictEqual(values, [undefined, undefined]);
  });
});
describe(`PushStream.prototype.subscribe: handles Subscriber exceptions`, () => {
  test(`terminate executes after error`, () => {
    let pass = true;
    const times = [0, 0];

    const subscription = new PushStream(() => {
      throw Error();
    }).subscribe({
      error: () => {
        times[0]++;
        if (times[1]) pass = false;
      },
      terminate: () => times[1]++
    });

    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 1], 'unexpected calls');
  });
  test(`captures terminate errors`, () => {
    const subscription = new PushStream(() => {
      throw Error();
    }).subscribe({
      terminate: () => {
        throw Error();
      }
    });

    assert(subscription.closed, 'Subscription open');
  });
  test(`captures terminate getter errors`, () => {
    const subscription = new PushStream(() => {
      throw Error();
    }).subscribe({
      get terminate(): any {
        throw Error();
      }
    });

    assert(subscription.closed, 'Subscription open');
  });
  test(`pre safe: resolves when Observer.error exists`, async () => {
    const times = [0, 0];
    const result: any[] = [false, false];

    new PushStream(() => {
      throw Error();
    }).subscribe({
      start(subscription) {
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      error: () => times[0]++,
      terminate: () => times[1]++
    });

    assert.deepStrictEqual(times, [1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`post safe: resolves when Observer.error exists`, async () => {
    const times = [0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream(() => {
      throw Error();
    }).subscribe({
      error: () => times[0]++,
      terminate: () => times[1]++
    });

    assert.deepStrictEqual(times, [1, 1]);
    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`pre safe: rejects when Observer.error does not exist`, async () => {
    const times = [0];
    const result: any[] = [false, false];

    const err = Error('foo');
    new PushStream(() => {
      throw err;
    }).subscribe({
      start(subscription) {
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      terminate: () => times[0]++
    });

    assert.deepStrictEqual(times, [1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects when Observer.error does not exist`, async () => {
    const times = [0];
    const result: any[] = [false, false];

    const err = Error();
    const subscription = new PushStream(() => {
      throw err;
    }).subscribe({
      terminate: () => times[0]++
    });

    assert.deepStrictEqual(times, [1]);
    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.start: unsubscribing`, () => {
  test(`succeeds`, () => {
    let pass = true;
    const times = [0, 0, 0];

    new PushStream(() => {
      times[1]++;
      return () => times[2]++;
    }).subscribe({
      start(subscription) {
        subscription.unsubscribe();
        if (!subscription.closed) pass = false;
      },
      terminate: () => {
        times[0]++;
        throw Error();
      }
    });

    assert(pass);
    assert.deepStrictEqual(times, [0, 0, 0]);
  });
  test(`pre safe: resolves`, async () => {
    const result: any[] = [false, false];

    new PushStream(() => undefined).subscribe({
      start(subscription) {
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
        subscription.unsubscribe();
      }
    });

    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`post safe: resolves`, async () => {
    const result: any[] = [false, false];

    const subscription = new PushStream(() => undefined).subscribe({
      start: (subscription) => subscription.unsubscribe()
    });

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
});
describe(`Observer.start: handles exceptions`, () => {
  test(`pre safe: rejects and closes subscription`, async () => {
    const times = [0, 0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream(() => {
      times[5]++;
      return () => times[6]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
        throw err;
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0, 0]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects and closes subscription`, async () => {
    const times = [0, 0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream(() => {
      times[5]++;
      return () => times[6]++;
    }).subscribe({
      start() {
        times[0]++;
        throw err;
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 1, 0]);
    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    assert.deepStrictEqual(times, [1, 0, 0, 0, 1, 1, 1]);
    assert(subscription.closed, 'Subscription open');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.start: handles getter exceptions`, () => {
  test(`post safe: rejects and closes subscription`, async () => {
    const times = [0, 0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream(() => {
      times[5]++;
      return () => times[6]++;
    }).subscribe({
      get start(): any {
        times[0]++;
        throw err;
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 1, 0]);
    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    assert.deepStrictEqual(times, [1, 0, 0, 0, 1, 1, 1]);
    assert(subscription.closed, 'Subscription open');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.next: succeeds`, () => {
  test(`pre safe: does not unsubscribe/resolve/reject`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const values = ['foo', 'bar', 'baz'];
    const responses: string[] = [];
    const subscription = new PushStream((obs) => {
      obs.next(values[0]);
      obs.next(values[1]);
      obs.next(values[2]);
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: (value) => {
        times[1]++;
        responses.push(value);
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(responses, values);
    assert.deepStrictEqual(times, [1, 3, 0, 0, 0, 0], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, false]);
  });
  test(`post safe: does not unsubscribe/resolve/reject`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const values = ['foo', 'bar', 'baz'];
    const responses: string[] = [];
    const subscription = new PushStream((obs) => {
      obs.next(values[0]);
      obs.next(values[1]);
      obs.next(values[2]);
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: (value) => {
        times[1]++;
        responses.push(value);
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(responses, values);
    assert.deepStrictEqual(times, [1, 3, 0, 0, 0, 0], 'unexpected calls');

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, false]);
  });
  test(`safe, async: does not unsubscribe/resolve/reject`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const values = ['foo', 'bar', 'baz'];
    const responses: string[] = [];
    const subscription = new PushStream((obs) => {
      Promise.resolve().then(() => {
        obs.next(values[0]);
        obs.next(values[1]);
        obs.next(values[2]);
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: (value) => {
        times[1]++;
        responses.push(value);
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert.deepStrictEqual(responses, []);
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0], 'unexpected calls');

    await Promise.resolve();
    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(responses, values);
    assert.deepStrictEqual(times, [1, 3, 0, 0, 0, 0], 'unexpected calls');

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, false]);
  });
});
describe(`Observer.next: handles exceptions`, () => {
  test('pre safe: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');

    const subscription = new PushStream<void>((obs) => {
      obs.next();
      obs.next();
      obs.error(Error());
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next() {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 1, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test('post safe: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    let obs: any;

    const subscription = new PushStream<void>((_) => {
      obs = _;
      obs.next();
      obs.next();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next() {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 2, 0, 0, 0, 0], 'unexpected calls');

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    obs.next();
    obs.error(Error());
    obs.complete();

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 2, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test('safe, async: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');

    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.next();
        obs.next();
        obs.error(Error());
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next() {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 1, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.next: handles getter exceptions`, () => {
  test('pre safe: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');

    const subscription = new PushStream<void>((obs) => {
      obs.next();
      obs.next();
      obs.error(Error());
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      get next(): any {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 1, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test('post safe: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    let obs: any;

    const subscription = new PushStream<void>((_) => {
      obs = _;
      obs.next();
      obs.next();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      get next(): any {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 2, 0, 0, 0, 0], 'unexpected calls');

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    obs.next();
    obs.error(Error());
    obs.complete();

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 2, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test('safe, async: rejects and closes subscription', async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');

    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.next();
        obs.next();
        obs.error(Error());
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      get next(): any {
        times[1]++;
        throw err;
      },
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    });

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 1, 0, 0, 1, 1], 'unexpected calls');
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.error: succeeds`, () => {
  test(`pre safe: resolves when present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`post safe: resolves when present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`safe, async: resolves when present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`pre safe: rejects when not present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(err);
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[4]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      complete: () => times[2]++,
      terminate: () => times[3]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects when not present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error();
    const subscription = new PushStream<void>((obs) => {
      obs.error(err);
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[4]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      complete: () => times[2]++,
      terminate: () => times[3]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects when not present in safe mode`, async () => {
    const times = [0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error();
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(err);
        obs.next();
        obs.complete();
        obs.error(Error());
      });
      return () => times[4]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      complete: () => times[2]++,
      terminate: () => times[3]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.error: second call behavior`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(err);
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(err);
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: resolves`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
        obs.error(err);
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
});
describe(`Observer.error: handles exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error() {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error() {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
        obs.error(Error());
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error() {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.error: handles getter exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      get error(): any {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      obs.error(Error());
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      get error(): any {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
        obs.error(Error());
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      get error(): any {
        times[2]++;
        throw err;
      },
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.error: handles teardown exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
      });
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.error: handles terminate exceptions`, () => {
  test(`pre safe: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.error(Error());
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.error(Error());
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.complete: succeeds`, () => {
  test(`sync: unsubscribes and calls terminate`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
  });
  test(`async: unsubscribes and calls terminate`, async () => {
    const times = [0, 0, 0, 0, 0, 0];

    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
  });
  test(`pre safe: resolves`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`post safe: resolves`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
  test(`safe, async: resolves`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [true, false]);
  });
});
describe(`Observer.complete: handles exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.complete: handles getter exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      get complete(): any {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      get complete(): any {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      get complete(): any {
        times[3]++;
        throw err;
      },
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.complete: handles teardown exceptions`, () => {
  test(`pre safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => {
        times[5]++;
        throw err;
      };
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => times[4]++
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
describe(`Observer.complete: handles terminate exceptions`, () => {
  test(`pre safe: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start(subscription) {
        times[0]++;
        subscription.then(
          () => (result[0] = true),
          (error) => (result[1] = error)
        );
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);
    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`post safe: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      obs.complete();
      obs.next();
      obs.complete();
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
  test(`safe, async: rejects on terminate error`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    const result: any[] = [false, false];

    const err = Error('foo');
    const subscription = new PushStream<void>((obs) => {
      Promise.resolve().then(() => {
        obs.complete();
        obs.next();
        obs.complete();
      });
      return () => times[5]++;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++,
      terminate() {
        times[4]++;
        throw err;
      }
    });

    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0, 0, 0]);

    await Promise.resolve();
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1, 1, 1]);

    subscription.then(
      () => (result[0] = true),
      (error) => (result[1] = error)
    );

    await Promise.resolve();
    assert.deepStrictEqual(result, [false, err]);
  });
});
