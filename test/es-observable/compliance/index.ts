/* eslint-disable no-new */
/* eslint-disable prefer-const */
import assert from 'assert';
import { Observables } from '../../../src';
import { catches } from '../../../src/helpers';
import { runTests } from '../module/tests';
import { engine, Test, test } from './engine';

export default engine((Observable: Observables.Constructor): Test[] => [
  test('ES Observable Test Runner', async () => {
    const { logger } = await runTests(Observable);
    assert(logger.failed === 0);
  }),
  test('Observable Constructor: does not throw when a function', () => {
    let pass = true;

    try {
      new Observable(() => undefined);
    } catch (_) {
      pass = false;
    }

    assert(pass);
  }),
  test('Observable Constructor: throws when not a function', () => {
    let pass = true;

    const Constructor: any = Observable;
    catches(() => {
      new Constructor(undefined);
      pass = false;
    });
    catches(() => {
      new Constructor(null);
      pass = false;
    });
    catches(() => {
      new Constructor(0);
      pass = false;
    });
    catches(() => {
      new Constructor(true);
      pass = false;
    });
    catches(() => {
      new Constructor('');
      pass = false;
    });
    catches(() => {
      new Constructor({});
      pass = false;
    });

    assert(pass);
  }),
  test('Observable Constructor: function does not get called on instantiation', () => {
    let pass = true;
    new Observable(() => {
      pass = false;
    });

    assert(pass);
  }),
  test('Observable[Symbol.observable]: is self', () => {
    const instance = new Observable(() => undefined);
    const res = instance[Symbol.observable]();
    assert(res === instance);
  }),
  test('Observable.subscribe: does not throw', () => {
    let pass = true;

    const Constructor: any = Observable;
    try {
      // Expected
      new Constructor(() => undefined).subscribe({});
      new Constructor(() => undefined).subscribe(() => undefined);
      new Constructor(() => undefined).subscribe(
        () => undefined,
        () => undefined,
        () => undefined
      );
      // Unexpected
      new Constructor(() => undefined).subscribe(undefined);
      new Constructor(() => undefined).subscribe(null);
      new Constructor(() => undefined).subscribe(0);
      new Constructor(() => undefined).subscribe(true);
      new Constructor(() => undefined).subscribe('');
    } catch (_) {
      pass = false;
    }

    assert(pass);
  }),
  test('Observable.subscribe: passes Subscriber exceptions to Observer.error', () => {
    let pass = true;
    const times = [0, 0, 0, 0];
    const err = Error('foo');

    new Observable(() => {
      throw err;
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: (error) => {
        times[2]++;
        if (error !== err) pass = false;
      },
      complete: () => times[3]++
    });

    assert(pass, 'received different Error instance');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observable.subscribe: silences Subscriber exceptions when no Observer.error exists', () => {
    let pass = true;

    const instance = new Observable(() => {
      throw Error();
    });

    try {
      instance.subscribe({});
    } catch (_) {
      pass = false;
    }

    assert(pass);
  }),
  test('Observable.subscribe: returns subscription', () => {
    const subscription = new Observable(() => undefined).subscribe({});

    assert(
      subscription &&
        typeof subscription.closed === 'boolean' &&
        typeof subscription.unsubscribe === 'function'
    );
  }),
  test('Observer.start: succeeds', () => {
    const times = [0, 0, 0, 0];
    let subs: any;

    const subscription = new Observable(() => undefined).subscribe({
      start(x) {
        subs = x;
        times[0]++;
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete: () => times[3]++
    });

    assert(subscription === subs, 'received different Subscription instance');
    assert.deepStrictEqual(times, [1, 0, 0, 0], 'unexpected calls');
  }),
  test('Observer.start: errors are catched', () => {
    let pass = true;
    const times = [0, 0, 0, 0];

    let subscription: any;
    try {
      subscription = new Observable(() => undefined).subscribe({
        start() {
          times[0]++;
          throw Error();
        },
        next: () => times[1]++,
        error: () => times[2]++,
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass, 'throws');
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0], 'unexpected calls');
  }),
  test('Observer.start: errors in getter are catched', () => {
    let pass = true;
    const times = [0, 0, 0, 0];

    let subscription: any;
    try {
      subscription = new Observable(() => undefined).subscribe({
        get start(): any {
          times[0]++;
          throw Error();
        },
        next: () => times[1]++,
        error: () => times[2]++,
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass, 'throws');
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 0, 0, 0], 'unexpected calls');
  }),
  test(`Observer.start: is not obtained more than once per call`, () => {
    const times = [0, 0];
    new Observable(() => undefined).subscribe({
      get start() {
        times[0]++;
        return () => undefined;
      }
    });
    new Observable(() => undefined).subscribe({
      get start() {
        times[1]++;
        return () => {
          throw Error();
        };
      }
    });

    assert.deepStrictEqual(times, [1, 1], 'unexpected get calls');
  }),
  test(`Observer.start: unsubscribing suceeds`, () => {
    let pass = true;

    new Observable(() => {
      pass = false;
    }).subscribe({
      start(subscription) {
        subscription.unsubscribe();
        if (!subscription.closed) pass = false;
      }
    });

    assert(pass);
  }),
  test('Observer.next: calls succeed (sync)', () => {
    const times = [0, 0, 0, 0];
    const values: string[] = [];
    let pass = true;

    const subscription = new Observable((obs) => {
      if (!times[0] || times[1]) pass = false;
      if (obs.next('foo') !== undefined) pass = false;
      if (times[1] !== 1) pass = false;
      if (obs.next('bar') !== undefined) pass = false;
      if (times[1] !== 2) pass = false;
    }).subscribe({
      start: () => times[0]++,
      next(value) {
        times[1]++;
        values.push(value);
        return 'baz';
      },
      error: () => times[2]++,
      complete: () => times[3]++
    });

    assert(pass);
    assert(
      values.length === 2 && values[0] === 'foo' && values[1] === 'bar',
      'unexpected values'
    );
    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 2, 0, 0], 'unexpected calls');
  }),
  test('Observer.next: calls succeed (async)', async () => {
    const times = [0, 0, 0, 0];
    const values: string[] = [];
    let pass = true;

    const subscription = new Observable((obs) => {
      Promise.resolve().then(() => {
        if (!times[0] || times[1]) pass = false;
        if (obs.next('foo') !== undefined) pass = false;
        if (times[1] !== 1) pass = false;
        if (obs.next('bar') !== undefined) pass = false;
        if (times[1] !== 2) pass = false;
      });
    }).subscribe({
      start: () => times[0]++,
      next(value) {
        times[1]++;
        values.push(value);
        return 'baz';
      },
      error: () => times[2]++,
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(
      values.length === 2 && values[0] === 'foo' && values[1] === 'bar',
      'unexpected values'
    );
    assert(!subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 2, 0, 0], 'unexpected calls');
  }),
  test('Observer.next: errors are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable<void>((obs) => {
        obs.next();
      }).subscribe({
        start: () => times[0]++,
        next() {
          times[1]++;
          throw Error();
        },
        error: () => times[2]++,
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 1, 0, 0], 'unexpected calls');
  }),
  test('Observer.next: errors are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable<void>((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.next();
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      next() {
        times[1]++;
        throw Error();
      },
      error: () => times[2]++,
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 1, 0, 0], 'unexpected calls');
  }),
  test('Observer.next: errors in getter are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable<void>((obs) => {
        obs.next();
      }).subscribe({
        start: () => times[0]++,
        get next(): any {
          times[1]++;
          throw Error();
        },
        error: () => times[2]++,
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 1, 0, 0], 'unexpected calls');
  }),
  test('Observer.next: errors in getter are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable<void>((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.next();
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      get next(): any {
        times[1]++;
        throw Error();
      },
      error: () => times[2]++,
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && !subscription.closed, 'Subscription closed');
    assert.deepStrictEqual(times, [1, 1, 0, 0], 'unexpected calls');
  }),
  test(`Observer.next: is not obtained more than once per call`, () => {
    const times = [0, 0];
    new Observable<void>((obs) => obs.next()).subscribe({
      get next() {
        times[0]++;
        return () => undefined;
      }
    });
    new Observable<void>((obs) => obs.next()).subscribe({
      get next() {
        times[1]++;
        return () => {
          throw Error();
        };
      }
    });

    assert.deepStrictEqual(times, [1, 1]);
  }),
  test('Observer.error: calls succeed (sync)', () => {
    const times = [0, 0, 0, 0];
    const errors: Error[] = [];
    let pass = true;

    const subscription = new Observable<void>((obs) => {
      if (!times[0] || times[2]) pass = false;
      if (obs.error(Error('foo')) !== undefined) pass = false;
      if (times[2] !== 1) pass = false;
      if (obs.error(Error('bar')) !== undefined) pass = false;
      obs.next();
      obs.complete();
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error(error) {
        times[2]++;
        errors.push(error);
        return 'baz';
      },
      complete: () => times[3]++
    });

    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert(
      errors.length === 1 && errors[0] && errors[0].message === 'foo',
      'unexpected errors'
    );
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: calls succeed (async)', async () => {
    const times = [0, 0, 0, 0];
    const errors: Error[] = [];
    let pass = true;

    const subscription = new Observable<void>((obs) => {
      Promise.resolve().then(() => {
        if (!times[0] || times[2]) pass = false;
        if (obs.error(Error('foo')) !== undefined) pass = false;
        if (times[2] !== 1) pass = false;
        if (obs.error(Error('bar')) !== undefined) pass = false;
        obs.next();
        obs.complete();
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error(error) {
        times[2]++;
        errors.push(error);
        return 'baz';
      },
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert(
      errors.length === 1 && errors[0] && errors[0].message === 'foo',
      'unexpected errors'
    );
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: errors are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable((obs) => {
        obs.error(Error());
      }).subscribe({
        start: () => times[0]++,
        next: () => times[1]++,
        error() {
          times[2]++;
          throw Error();
        },
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: errors are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(Error());
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error() {
        times[2]++;
        throw Error();
      },
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: errors in getter are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable((obs) => {
        obs.error(Error());
      }).subscribe({
        start: () => times[0]++,
        next: () => times[1]++,
        get error(): any {
          times[2]++;
          throw Error();
        },
        complete: () => times[3]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: errors in getter are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(Error());
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      get error(): any {
        times[2]++;
        throw Error();
      },
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test(`Observer.error: is not obtained more than once per call`, () => {
    const times = [0, 0];
    new Observable((obs) => obs.error(Error())).subscribe({
      get error() {
        times[0]++;
        return () => undefined;
      }
    });
    new Observable((obs) => obs.error(Error())).subscribe({
      get error() {
        times[1]++;
        return () => {
          throw Error();
        };
      }
    });

    assert.deepStrictEqual(times, [1, 1]);
  }),
  test('Observer.error: closes Subscription before call (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    let obs: any;
    let subscription: any;
    new Observable((_) => {
      obs = _;
      obs.error(Error('foo'));
    }).subscribe({
      start(_) {
        subscription = _;
        times[0]++;
      },
      next: () => times[1]++,
      error() {
        if (times[2] || !subscription.closed) {
          pass = false;
          return;
        }

        times[2]++;
        obs.next();
        obs.error(Error('bar'));
        obs.complete();
      },
      complete: () => times[3]++
    });

    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: closes Subscription before call (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    let obs: any;
    const subscription = new Observable((_) => {
      obs = _;
      Promise.resolve().then(() => obs.error(Error('foo')));
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error() {
        if (times[2] || !subscription.closed) {
          pass = false;
          return;
        }

        times[2]++;
        obs.next();
        obs.error(Error('bar'));
        obs.complete();
      },
      complete: () => times[3]++
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 1, 0], 'unexpected calls');
  }),
  test('Observer.error: does not throw when non existent', () => {
    let pass = true;

    let subscription: any;
    try {
      subscription = new Observable((obs) => {
        obs.error(Error());
      }).subscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test('Observer.error: does not throw when existent', () => {
    let pass = true;

    let subscription: any;
    try {
      subscription = new Observable((obs) => {
        obs.error(Error());
      }).subscribe({
        error: () => undefined
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test('Observer.error: teardown is called after (sync)', () => {
    let errorCalled = false;
    let teardownCalled = false;
    let teardownCalledBefore = false;

    new Observable((obs) => {
      obs.error(Error());
      return () => (teardownCalled = true);
    }).subscribe({
      error() {
        errorCalled = true;
        if (teardownCalled) teardownCalledBefore = true;
      }
    });

    assert(errorCalled, 'not called');
    assert(!teardownCalledBefore, 'teardown called before');
  }),
  test('Observer.error: teardown is called after (async)', async () => {
    let errorCalled = false;
    let teardownCalled = false;
    let teardownCalledBefore = false;

    new Observable((obs) => {
      Promise.resolve().then(() => obs.error(Error()));
      return () => (teardownCalled = true);
    }).subscribe({
      error() {
        errorCalled = true;
        if (teardownCalled) teardownCalledBefore = true;
      }
    });

    await Promise.resolve();
    assert(errorCalled, 'not called');
    assert(!teardownCalledBefore, 'teardown called before');
  }),
  test(`Observer.error: catches teardown errors (sync)`, () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable((obs) => {
        obs.error(Error());
        return () => {
          teardownCalled = true;
          throw new Error();
        };
      }).subscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test(`Observer.error: catches teardown errors (async)`, async () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable((obs) => {
        Promise.resolve().then(() => {
          try {
            obs.error(Error());
          } catch (_) {
            pass = false;
          }
        });
        return () => {
          teardownCalled = true;
          throw new Error();
        };
      }).subscribe();
    } catch (_) {
      pass = false;
    }

    await Promise.resolve();
    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test('Observer.complete: calls succeed (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    const subscription = new Observable((obs: any) => {
      if (!times[0] || times[3]) pass = false;
      if (obs.complete('foo') !== undefined) pass = false;
      if (times[3] !== 1) pass = false;
      if (obs.complete('bar') !== undefined) pass = false;
      obs.error(Error());
      obs.complete();
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete(reason?: any) {
        times[3]++;
        if (reason !== undefined) pass = false;
        return 'baz';
      }
    });

    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: calls succeed (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    const subscription = new Observable((obs: any) => {
      Promise.resolve().then(() => {
        if (!times[0] || times[3]) pass = false;
        if (obs.complete('foo') !== undefined) pass = false;
        if (times[3] !== 1) pass = false;
        if (obs.complete('bar') !== undefined) pass = false;
        obs.error(Error());
        obs.complete();
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete(reason?: any) {
        times[3]++;
        if (reason !== undefined) pass = false;
        return 'baz';
      }
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: errors are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable((obs) => {
        obs.complete();
      }).subscribe({
        start: () => times[0]++,
        next: () => times[1]++,
        error: () => times[2]++,
        complete() {
          times[3]++;
          throw Error();
        }
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: errors are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.complete();
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        times[3]++;
        throw Error();
      }
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: errors in getter are catched (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    try {
      subscription = new Observable((obs) => {
        obs.complete();
      }).subscribe({
        start: () => times[0]++,
        next: () => times[1]++,
        error: () => times[2]++,
        get complete(): any {
          times[3]++;
          throw Error();
        }
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: errors in getter are catched (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;
    let subscription: any;

    subscription = new Observable((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.complete();
        } catch (_) {
          pass = false;
        }
      });
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      get complete(): any {
        times[3]++;
        throw Error();
      }
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription && subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test(`Observer.complete: is not obtained more than once per call`, () => {
    const times = [0, 0];
    new Observable((obs) => obs.complete()).subscribe({
      get complete() {
        times[0]++;
        return () => undefined;
      }
    });
    new Observable((obs) => obs.complete()).subscribe({
      get complete() {
        times[1]++;
        return () => {
          throw Error();
        };
      }
    });

    assert.deepStrictEqual(times, [1, 1]);
  }),
  test('Observer.complete: closes Subscription before call (sync)', () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    let obs: any;
    let subscription: any;
    new Observable((_) => {
      obs = _;
      obs.complete();
    }).subscribe({
      start(_) {
        subscription = _;
        times[0]++;
      },
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        if (times[3] || !subscription.closed) {
          pass = false;
          return;
        }

        times[3]++;
        obs.next();
        obs.complete();
        obs.error(Error('bar'));
      }
    });

    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: closes Subscription before call (async)', async () => {
    const times = [0, 0, 0, 0];
    let pass = true;

    let obs: any;
    const subscription = new Observable((_) => {
      obs = _;
      Promise.resolve().then(() => obs.complete());
    }).subscribe({
      start: () => times[0]++,
      next: () => times[1]++,
      error: () => times[2]++,
      complete() {
        if (times[3] || !subscription.closed) {
          pass = false;
          return;
        }

        times[3]++;
        obs.next();
        obs.complete();
        obs.error(Error('bar'));
      }
    });

    await Promise.resolve();
    assert(pass);
    assert(subscription.closed, 'Subscription open');
    assert.deepStrictEqual(times, [1, 0, 0, 1], 'unexpected calls');
  }),
  test('Observer.complete: teardown is called after (sync)', () => {
    let completeCalled = false;
    let teardownCalled = false;
    let teardownCalledBefore = false;

    new Observable((obs) => {
      obs.complete();
      return () => (teardownCalled = true);
    }).subscribe({
      complete() {
        completeCalled = true;
        if (teardownCalled) teardownCalledBefore = true;
      }
    });

    assert(completeCalled, 'complete not called');
    assert(!teardownCalledBefore, 'teardown called before');
  }),
  test('Observer.complete: teardown is called after (async)', async () => {
    let completeCalled = false;
    let teardownCalled = false;
    let teardownCalledBefore = false;

    new Observable((obs) => {
      Promise.resolve().then(() => obs.complete());
      return () => (teardownCalled = true);
    }).subscribe({
      complete() {
        completeCalled = true;
        if (teardownCalled) teardownCalledBefore = true;
      }
    });

    await Promise.resolve();

    assert(completeCalled, 'complete not called');
    assert(!teardownCalledBefore, 'teardown called before');
  }),
  test(`Observer.complete: catches teardown errors (sync)`, () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable((obs) => {
        obs.complete();
        return () => {
          teardownCalled = true;
          throw new Error();
        };
      }).subscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test(`Observer.complete: catches teardown errors (async)`, async () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable((obs: any) => {
        Promise.resolve().then(() => {
          try {
            obs.complete();
          } catch (_) {
            pass = false;
          }
        });
        return () => {
          teardownCalled = true;
          throw new Error();
        };
      }).subscribe();
    } catch (_) {
      pass = false;
    }

    await Promise.resolve();
    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test(`Subscription.unsubscribe: immediately silences Observer calls (sync)`, () => {
    let called = false;
    const fn = (): void => (called = true) && undefined;

    let obs: any;
    const subscription = new Observable((_) => {
      obs = _;
    }).subscribe({ next: fn, error: fn, complete: fn });

    subscription.unsubscribe();

    assert(subscription.closed);

    obs.next();
    obs.next();

    assert(subscription.closed && !called);

    obs.error();
    obs.error();

    assert(subscription.closed && !called);

    obs.complete();
    obs.complete();

    assert(subscription.closed && !called);
  }),
  test(`Subscription.unsubscribe: immediately silences Observer calls (async)`, async () => {
    let called = false;
    const fn = (): void => (called = true) && undefined;

    let obs: any;
    const subscription = new Observable((_) => {
      obs = _;
    }).subscribe({ next: fn, error: fn, complete: fn });

    await Promise.resolve();
    subscription.unsubscribe();

    assert(subscription.closed);

    obs.next();
    obs.next();

    assert(subscription.closed && !called);

    obs.error();
    obs.error();

    assert(subscription.closed && !called);

    obs.complete();
    obs.complete();

    assert(subscription.closed && !called);
  }),
  test(`Subscription.unsubscribe: catches teardown errors (sync)`, () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable(() => {
        return () => {
          teardownCalled = true;
          throw Error();
        };
      }).subscribe();
      subscription.unsubscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  }),
  test(`Subscription.unsubscribe: catches teardown errors (async)`, async () => {
    let pass = true;
    let teardownCalled = false;

    let subscription: any;
    try {
      subscription = new Observable(() => {
        return () => {
          teardownCalled = true;
          throw Error();
        };
      }).subscribe();
      await Promise.resolve();
      subscription.unsubscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert(teardownCalled, 'teardown not called');
    assert(subscription && subscription.closed, 'Subscription open');
  })
]);
