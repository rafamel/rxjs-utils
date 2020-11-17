import {
  PushStream,
  Observable,
  isObservableCompatible,
  isObservableLike
} from '@push';
import { Handler } from '@helpers';
import assert from 'assert';

test(`PushStream is ObservableLike`, () => {
  const instance = new PushStream(() => undefined);
  assert(isObservableLike(instance));
});
test(`PushStream is ObservableCompatible`, () => {
  const instance = new PushStream(() => undefined);
  assert(isObservableCompatible(instance));

  const observable = instance[Symbol.observable]();
  assert(observable instanceof Observable);
});
test(`PushStream.from: creates from ObservableLike`, () => {
  const instance = new PushStream((obs) => obs.next('foo'));
  const obs = { subscribe: instance.subscribe.bind(instance) };

  let response: any;
  PushStream.from(obs).subscribe((value) => (response = value));

  assert(response === 'foo');
});
test(`Subscribe: rejects when Observer is not empty, a function or an object`, async () => {
  const instance: any = new PushStream(() => undefined);

  let pass = true;
  await instance.subscribe(0).then(() => (pass = false), Handler.noop);
  await instance.subscribe(false).then(() => (pass = false), Handler.noop);
  await instance.subscribe('').then(() => (pass = false), Handler.noop);

  assert(pass);
});
test(`Subscribe: Doesn't reject when Observer is empty, a function or an object`, async () => {
  const instance = new PushStream(() => undefined);

  const subscriptions = [
    instance.subscribe(),
    instance.subscribe(null),
    instance.subscribe(undefined),
    instance.subscribe(() => undefined),
    instance.subscribe({})
  ];

  subscriptions.map((subscription) => subscription.unsubscribe());

  await Promise.all(subscriptions);
});
test(`Subscription.unsubscribe: rejects when subscriber fails`, async () => {
  const instance = new PushStream(() => {
    return () => {
      throw Error();
    };
  });

  const subscription = instance.subscribe();
  subscription.unsubscribe();

  let pass = false;
  await subscription.catch(() => (pass = true));

  assert(pass);
});
test(`Subscription.unsubscribe: rejects when subscriber succeeds and terminate fails`, async () => {
  const instance = new PushStream(() => {
    return () => undefined;
  });
  const subscription = instance.subscribe({
    terminate: () => {
      throw Error();
    }
  });
  subscription.unsubscribe();

  let pass = false;
  await subscription.catch(() => (pass = true));

  assert(pass);
});
test(`Subscription.unsubscribe: doesn't reject when subscriber and terminate succeeds`, async () => {
  const instance = new PushStream(() => () => undefined);

  const subscription = instance.subscribe();
  subscription.unsubscribe();

  let pass = true;
  await subscription.catch(() => (pass = false));

  assert(pass);
});
test(`Observer.start: rejects when it fails`, async () => {
  const times = [0, 0, 0];

  const instance = new PushStream(() => {
    times[0]++;
  });

  let res: any;
  const error = Error('foo');

  const subscription = instance.subscribe({
    start: () => {
      times[1]++;
      throw error;
    },
    terminate: () => {
      times[2]++;
      throw Error();
    }
  });

  assert.deepStrictEqual(times, [0, 1, 1]);
  await subscription.catch((err) => (res = err));
  assert(res === error);
});
test(`Observer.start: doesn't reject when it succeeds`, async () => {
  const times = [0, 0];

  const subscription = new PushStream(() => {
    times[0]++;
  }).subscribe({
    start: () => times[1]++
  });

  assert.deepStrictEqual(times, [1, 1]);

  subscription.unsubscribe();
  await subscription;
});
test(`Observer.next: rejects when it fails (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream<void>((obs) => {
    times[0]++;
    obs.next();
    return () => {
      times[1]++;
      throw Error();
    };
  });

  const error = Error('foo');
  let res: any;

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => {
        times[3]++;
        throw error;
      },
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.next: rejects when it fails (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const promise = new PushStream<void>((obs) => {
    Promise.resolve().then(() => obs.next());
    times[0]++;
    return () => {
      times[1]++;
      throw Error();
    };
  })
    .subscribe({
      start: () => times[2]++,
      next: () => {
        times[3]++;
        throw error;
      },
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 0, 1, 0, 0, 0, 0]);
  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.next: doesn't reject when it succeeds (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const subscription = new PushStream<void>((obs) => {
    times[0]++;
    obs.next();
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0, 0]);

  subscription.unsubscribe();
  await subscription;

  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0, 1]);
});
test(`Observer.next: doesn't reject when it succeeds (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const subscription = new PushStream<void>((obs) => {
    Promise.resolve().then(() => obs.next());
    times[0]++;
    return () => times[1]++;
  }).subscribe({
    start: () => times[2]++,
    next: () => times[3]++,
    error: () => times[4]++,
    complete: () => times[5]++,
    terminate: () => times[6]++
  });

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 0, 1, 1, 0, 0, 0]);

  subscription.unsubscribe();
  await subscription;

  assert.deepStrictEqual(times, [1, 1, 1, 1, 0, 0, 1]);
});
test(`Observer.error: rejects when it fails (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.error(Error());
    return () => {
      times[1]++;
      throw Error();
    };
  });

  const error = Error('foo');
  let res: any;

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => {
        times[4]++;
        throw error;
      },
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);

  await promise;
  assert(res === error);
});
test(`Observer.error: rejects when it fails (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const promise = new PushStream((obs) => {
    Promise.resolve().then(() => obs.error(Error()));
    times[0]++;
    return () => {
      times[1]++;
      throw Error();
    };
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => {
        times[4]++;
        throw error;
      },
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);

  await promise;
  assert(res === error);
});
test(`Observer.error: doesn't reject after it's closed (sync)`, async () => {
  let pass = true;
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.error(Error());
    obs.error(Error());
    obs.error(Error());
    return () => times[1]++;
  });

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);
  await promise;
  assert(pass);
});
test(`Observer.error: doesn't reject after it's closed (async)`, async () => {
  let pass = true;
  const times = [0, 0, 0, 0, 0, 0, 0];

  const promise = new PushStream((obs) => {
    Promise.resolve().then(() => obs.error(Error()));
    times[0]++;
    obs.error(Error());
    return () => times[1]++;
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);
  await promise;
  assert(pass);
});
test(`Observer.error: rejects when there's no listener (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.error(error);
    return () => {
      times[1]++;
      throw Error();
    };
  });

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      complete: () => times[4]++,
      terminate: () => {
        times[5]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.error: rejects when there's no listener (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const promise = new PushStream((obs) => {
    Promise.resolve().then(() => obs.error(error));
    times[0]++;
    return () => {
      times[1]++;
      throw Error();
    };
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      complete: () => times[4]++,
      terminate: () => {
        times[5]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.error: doesn't reject when it succeeds and there's a listener (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  let pass = true;

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.error(Error());
    return () => times[1]++;
  });

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);
  await promise;
  assert(pass);
});
test(`Observer.error: doesn't reject when it succeeds and there's a listener (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  let pass = true;

  const promise = new PushStream((obs) => {
    Promise.resolve().then(() => obs.error(Error()));
    times[0]++;
    return () => times[1]++;
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 1, 0, 1]);
  await promise;
  assert(pass);
});
test(`Observer.error: catches Subscriber errors`, async () => {
  const times = [0, 0, 0, 0, 0, 0];

  let pass = true;
  const error = Error('foo');
  let res: any;

  const promise = new PushStream(() => {
    times[0]++;
    throw error;
  })
    .subscribe({
      start: () => times[1]++,
      next: () => times[2]++,
      error: (err) => {
        times[3]++;
        res = err;
      },
      complete: () => times[4]++,
      terminate: () => times[5]++
    })
    .catch(() => (pass = false));

  assert(res === error);
  assert.deepStrictEqual(times, [1, 1, 0, 1, 0, 1]);
  await promise;
  assert(pass);
});
test(`Observer.error: catches Subscriber errors and rejects on failure`, async () => {
  const times = [0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const instance = new PushStream(() => {
    times[0]++;
    throw error;
  });

  const promise = instance
    .subscribe({
      start: () => times[1]++,
      next: () => times[2]++,
      error: (err) => {
        times[3]++;
        throw err;
      },
      complete: () => times[4]++,
      terminate: () => {
        times[5]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 0, 1, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.error: catches Subscriber errors and rejects when lacking listener`, async () => {
  const times = [0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const instance = new PushStream(() => {
    times[0]++;
    throw error;
  });

  const promise = instance
    .subscribe({
      start: () => times[1]++,
      next: () => times[2]++,
      complete: () => times[3]++,
      terminate: () => {
        times[4]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 0, 0, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.complete: rejects when it fails (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.complete();
    return () => {
      times[1]++;
      throw Error();
    };
  });

  const error = Error('foo');
  let res: any;

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => {
        times[5]++;
        throw error;
      },
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.complete: rejects when it fails (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const error = Error('foo');
  let res: any;

  const promise = new PushStream((obs) => {
    Promise.resolve().then(() => obs.complete());
    times[0]++;
    return () => {
      times[1]++;
      throw Error();
    };
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => {
        times[5]++;
        throw error;
      },
      terminate: () => {
        times[6]++;
        throw Error();
      }
    })
    .catch((err) => (res = err));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.complete: rejects when it succeeds and terminate fails (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.complete();
    return () => times[1]++;
  });

  const error = Error('foo');
  let res: any;

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw error;
      }
    })
    .catch((err) => (res = err));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.complete: rejects when it succeeds and terminate fails (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];

  const instance = new PushStream((obs) => {
    Promise.resolve().then(() => obs.complete());
    times[0]++;
    return () => times[1]++;
  });

  const error = Error('foo');
  let res: any;

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => {
        times[6]++;
        throw error;
      }
    })
    .catch((err) => (res = err));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(res === error);
});
test(`Observer.complete: doesn't reject when it succeeds (sync)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  let pass = true;

  const instance = new PushStream((obs) => {
    times[0]++;
    obs.complete();
    obs.complete();
    return () => times[1]++;
  });

  const promise = instance
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(pass);
});
test(`Observer.complete: doesn't reject when it succeeds (async)`, async () => {
  const times = [0, 0, 0, 0, 0, 0, 0];
  let pass = true;

  const promise = new PushStream((obs) => {
    times[0]++;
    Promise.resolve().then(() => {
      obs.complete();
      obs.complete();
    });
    return () => times[1]++;
  })
    .subscribe({
      start: () => times[2]++,
      next: () => times[3]++,
      error: () => times[4]++,
      complete: () => times[5]++,
      terminate: () => times[6]++
    })
    .catch(() => (pass = false));

  await Promise.resolve();
  assert.deepStrictEqual(times, [1, 1, 1, 0, 0, 1, 1]);
  await promise;
  assert(pass);
});
