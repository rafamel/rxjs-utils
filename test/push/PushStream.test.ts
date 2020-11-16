import { PushStream } from '@push';
import { Handler } from '@helpers';
import { isObservableCompatible, isObservableLike } from '@utils';
import compliance from '../es-observable/compliance';
import assert from 'assert';

class RaisePushStream<T = void> extends PushStream<T> {
  public static raise: boolean = true;
}

describe(`General`, () => {
  test(`Complies with Observable spec`, async () => {
    const response = await compliance('PushStream', PushStream, 'silent');
    assert(response.result[1].length === 0);
  });
  test(`PushStream is Observable`, () => {
    const instance = new PushStream(() => undefined);
    assert(isObservableLike(instance));
    assert(isObservableCompatible(instance));
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
describe(`PushStream.raise`, () => {
  test(`Subscribe: throws when Observer is not empty, a function or an object`, () => {
    let pass = true;
    const instance: any = new RaisePushStream(() => undefined);

    Handler.catches(() => {
      instance.subscribe(0);
      pass = false;
    });
    Handler.catches(() => {
      instance.subscribe(false);
      pass = false;
    });
    Handler.catches(() => {
      instance.subscribe('');
      pass = false;
    });

    assert(pass);
  });
  test(`Subscribe: Doesn't throw when Observer is empty, a function or an object`, () => {
    const instance = new RaisePushStream(() => undefined);
    instance.subscribe();
    instance.subscribe(null);
    instance.subscribe(undefined);
    instance.subscribe(() => undefined);
    instance.subscribe({});
  });
  test(`Subscription.unsubscribe: throws when it fails`, () => {
    const instance = new RaisePushStream(() => {
      return () => {
        throw Error();
      };
    });

    let pass = true;
    Handler.catches(() => {
      instance.subscribe().unsubscribe();
      pass = false;
    });

    assert(pass);
  });
  test(`Subscription.unsubscribe: doesn't throw when it succeeds`, () => {
    const instance = new RaisePushStream(() => () => undefined);

    let pass = true;
    try {
      instance.subscribe().unsubscribe();
    } catch (_) {
      pass = false;
    }

    assert(pass);
  });
  test(`Observer.start: throws when it fails`, () => {
    const times = [0, 0];

    const instance = new RaisePushStream(() => {
      times[0]++;
    });

    const error = Error('foo');
    let res: any;

    try {
      instance.subscribe({
        start: () => {
          times[1]++;
          throw error;
        }
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [0, 1]);
  });
  test(`Observer.start: doesn't throw when it succeeds`, () => {
    const times = [0, 0];

    new RaisePushStream(() => {
      times[0]++;
    }).subscribe({
      start: () => times[1]++
    });

    assert.deepStrictEqual(times, [1, 1]);
  });
  test(`Observer.next: throws when it fails (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.next();
      return () => {
        times[1]++;
        throw Error('bar');
      };
    });

    const error = Error('foo');
    let res: any;

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => {
          times[3]++;
          throw error;
        },
        error: () => times[4]++,
        complete: () => times[5]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
  });
  test(`Observer.next: throws when it fails (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.next();
        } catch (err) {
          res = err;
        }
      });

      times[0]++;
      return () => {
        times[1]++;
        throw Error('bar');
      };
    }).subscribe({
      start: () => times[2]++,
      next: () => {
        times[3]++;
        throw error;
      },
      error: () => times[4]++,
      complete: () => times[5]++
    });

    await Promise.resolve();
    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0]);
  });
  test(`Observer.next: doesn't throw when it succeeds (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    new RaisePushStream((obs) => {
      times[0]++;
      obs.next();
      return () => times[1]++;
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    });

    assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);
  });
  test(`Observer.next: doesn't throw when it succeeds (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    let pass = true;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.next();
        } catch (_) {
          pass = false;
        }
      });

      times[0]++;
      return () => times[1]++;
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    });

    await Promise.resolve();
    assert(pass);
    assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0]);
  });
  test(`Observer.error: throws when it fails (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.error(Error());
      return () => {
        times[1]++;
        throw Error();
      };
    });

    const error = Error('foo');
    let res: any;

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        error: () => {
          times[4]++;
          throw error;
        },
        complete: () => times[5]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: throws when it fails (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(Error());
        } catch (err) {
          res = err;
        }
      });

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
    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: throws after it's closed (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.error(Error());
      obs.error(error);
      obs.error(Error());
      return () => {
        times[1]++;
        throw Error();
      };
    });

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        error: () => times[4]++,
        complete: () => times[5]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: throws after it's closed (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(error);
        } catch (err) {
          res = err;
        }
      });

      times[0]++;
      obs.error(Error());
      return () => times[1]++;
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    });

    await Promise.resolve();
    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: throws when there's no listener (sync)`, () => {
    const times = [0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.error(error);
      return () => {
        times[1]++;
        throw Error();
      };
    });

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        complete: () => times[4]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0]);
  });
  test(`Observer.error: throws when there's no listener (async)`, async () => {
    const times = [0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(error);
        } catch (err) {
          res = err;
        }
      });

      times[0]++;
      return () => {
        times[1]++;
        throw Error();
      };
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      complete: () => times[4]++
    });

    await Promise.resolve();
    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0]);
  });
  test(`Observer.error: doesn't throw when it succeeds and there's a listener (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];
    let pass = true;

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.error(Error());

      return () => times[1]++;
    });

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        error: () => times[4]++,
        complete: () => times[5]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: doesn't throw when it succeeds and there's a listener (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    let pass = true;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.error(Error());
        } catch (_) {
          pass = false;
        }
      });

      times[0]++;
      return () => times[1]++;
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    });

    await Promise.resolve();
    assert(pass);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0]);
  });
  test(`Observer.error: catches Subscriber errors`, () => {
    const times = [0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream(() => {
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
    assert.deepStrictEqual(times, [1, 1, 0, 1, 0]);
  });
  test(`Observer.error: catches Subscriber errors and throws on failure`, () => {
    const times = [0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    const instance = new RaisePushStream(() => {
      times[0]++;
      throw error;
    });

    try {
      instance.subscribe({
        start: () => times[1]++,
        next: () => times[2]++,
        error: (err) => {
          times[3]++;
          throw err;
        },
        complete: () => times[4]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 0, 1, 0]);
  });
  test(`Observer.error: catches Subscriber errors and throws when lacking listener`, () => {
    const times = [0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    const instance = new RaisePushStream(() => {
      times[0]++;
      throw error;
    });

    try {
      instance.subscribe({
        start: () => times[1]++,
        next: () => times[2]++,
        complete: () => times[3]++
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 0, 0]);
  });
  test(`Observer.complete: throws when it fails (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.complete();
      return () => {
        times[1]++;
        throw Error();
      };
    });

    const error = Error('foo');
    let res: any;

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        error: () => times[4]++,
        complete: () => {
          times[5]++;
          throw error;
        }
      });
    } catch (err) {
      res = err;
    }

    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  });
  test(`Observer.complete: throws when it fails (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];

    const error = Error('foo');
    let res: any;

    new RaisePushStream((obs) => {
      Promise.resolve().then(() => {
        try {
          obs.complete();
        } catch (err) {
          res = err;
        }
      });
      times[0]++;
      return () => {
        times[1]++;
        throw Error();
      };
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
    assert(res === error);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  });
  test(`Observer.complete: doesn't throw when it succeeds (sync)`, () => {
    const times = [0, 0, 0, 0, 0, 0];
    let pass = true;

    const instance = new RaisePushStream((obs) => {
      times[0]++;
      obs.complete();
      obs.complete();

      return () => times[1]++;
    });

    try {
      instance.subscribe({
        start: () => times[2]++,
        next: () => times[3]++,
        error: () => times[4]++,
        complete: () => times[5]++
      });
    } catch (_) {
      pass = false;
    }

    assert(pass);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  });
  test(`Observer.complete: doesn't throw when it succeeds (async)`, async () => {
    const times = [0, 0, 0, 0, 0, 0];
    let pass = true;

    new RaisePushStream((obs) => {
      times[0]++;
      Promise.resolve().then(() => {
        try {
          obs.complete();
          obs.complete();
        } catch (_) {
          pass = false;
        }
      });

      return () => times[1]++;
    }).subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++
    });

    await Promise.resolve();
    assert(pass);
    assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  });
});
