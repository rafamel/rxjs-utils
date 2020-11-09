/* eslint-disable no-new */
import assert from 'assert';
import { Stream, Talkback } from '../../src';
import { Handler } from '../../src/helpers';

test('Constructor: throws when not a function', () => {
  let pass = true;

  const Constructor: any = Stream;
  Handler.catches(() => {
    new Constructor(undefined);
    pass = false;
  });
  Handler.catches(() => {
    new Constructor(null);
    pass = false;
  });
  Handler.catches(() => {
    new Constructor(0);
    pass = false;
  });
  Handler.catches(() => {
    new Constructor(true);
    pass = false;
  });
  Handler.catches(() => {
    new Constructor('');
    pass = false;
  });
  Handler.catches(() => {
    new Constructor({});
    pass = false;
  });

  assert(pass);
});
test(`Constructor: doesn't call param function`, () => {
  let times = 0;
  new Stream(() => times++);
  assert(times === 0);
});
test(`Source: retrieval succeeds`, () => {
  const obj: any = {};
  const times = [0, 0, 0];

  const instance = new Stream(() => {
    times[0]++;
  });

  instance.source(() => {
    times[1]++;
    return obj;
  });
  instance.source(() => {
    times[2]++;
    return obj;
  });

  assert.deepStrictEqual(times, [2, 0, 0]);
});
test(`Source: execution upon exchange doesn't throw when Hearback is empty`, () => {
  const obj: any = {};
  let pass = true;

  try {
    new Stream((exchange) => exchange(undefined as any)).source(() => obj);
  } catch (_) {
    pass = false;
  }

  try {
    new Stream((exchange) => exchange(undefined as any)).source(() => obj);
  } catch (_) {
    pass = false;
  }

  assert(pass);
});
test(`Source: execution upon exchange throws when Hearback is not an object`, () => {
  const obj: any = {};
  let pass = true;

  Handler.catches(() => {
    new Stream((exchange) => exchange(0 as any)).source(() => obj);
    pass = false;
  });
  Handler.catches(() => {
    new Stream((exchange) => exchange(true as any)).source(() => obj);
    pass = false;
  });
  Handler.catches(() => {
    new Stream((exchange) => exchange('' as any)).source(() => obj);
    pass = false;
  });

  assert(pass);
});
test(`Source: execution upon exchange succeeds`, () => {
  const obj: any = {};
  const values = [{}, {}];
  const times = [0, 0];

  const instance = new Stream((exchange) => {
    times[0]++;
    values[0] = exchange({});
  });

  instance.source((value) => {
    times[1]++;
    values[1] = value;
    return obj;
  });

  assert(values[0] === obj);
  assert(values[1] instanceof Talkback);
  assert.deepStrictEqual(times, [1, 1]);
});
test(`Consume: Provider is not executed if Consumer exchange is not called`, () => {
  let times = 0;
  new Stream(() => times++).consume(() => undefined);
  assert(times === 0);
});
test(`Consume: Provider is executed if Consumer exchange is called`, () => {
  let times = 0;
  new Stream(() => times++).consume((exchange) => exchange());
  assert(times === 1);
});
test(`Consume: throws and doesn't execute Provider if Consumer throws before exchange`, () => {
  const times = [[0], [0]];
  const err = Error('foo');
  let res: any;

  try {
    new Stream(() => {
      times[0][0]++;
    }).consume(() => {
      times[1][0]++;
      throw err;
    });
  } catch (error) {
    res = error;
  }

  assert(res === err);
  assert.deepStrictEqual(times, [[0], [1]]);
});
test(`Consume: throws and terminates if Consumer throws after exchange`, () => {
  const times = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  let pass = true;
  const err = Error('foo');
  let res: any;
  let ptb: any;
  let ctb: any;

  try {
    new Stream((exchange) => {
      times[0][0]++;
      ctb = exchange({
        next: () => times[0][1]++,
        error: () => times[0][2]++,
        complete: () => times[0][3]++,
        terminate: () => {
          times[0][4]++;
          if (!ctb.closed) pass = false;
          if (!ptb.closed) pass = false;
        }
      });
    }).consume((exchange) => {
      times[1][0]++;
      ptb = exchange({
        next: () => times[1][1]++,
        error: () => times[1][2]++,
        complete: () => times[1][3]++,
        terminate: () => {
          times[1][4]++;
          if (ptb.closed) pass = false;
        }
      });
      throw err;
    });
  } catch (error) {
    res = error;
  }

  assert(pass);
  assert(res === err);
  assert.deepStrictEqual(times, [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ]);
});
test(`Consume: throws and terminates if provider throws before exchange`, () => {
  const times = [[0], [0, 0, 0, 0, 0]];
  const err = Error('foo');
  let res: any;

  try {
    new Stream(() => {
      times[0][0]++;
      throw err;
    }).consume((exchange) => {
      times[1][0]++;
      exchange({
        next: () => times[1][1]++,
        error: () => times[1][2]++,
        complete: () => times[1][3]++,
        terminate: () => times[1][4]++
      });
    });
  } catch (error) {
    res = error;
  }

  assert(res === err);
  assert.deepStrictEqual(times, [[1], [1, 0, 0, 0, 1]]);
});
test(`Consume: throws and terminates if provider throws after exchange`, () => {
  const times = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  const err = Error('foo');
  let res: any;

  try {
    new Stream((exchange) => {
      times[0][0]++;
      exchange({
        next: () => times[0][1]++,
        error: () => times[0][2]++,
        complete: () => times[0][3]++,
        terminate: () => times[0][4]++
      });
      throw err;
    }).consume((exchange) => {
      times[1][0]++;
      exchange({
        next: () => times[1][1]++,
        error: () => times[1][2]++,
        complete: () => times[1][3]++,
        terminate: () => times[1][4]++
      });
    });
  } catch (error) {
    res = error;
  }

  assert(res === err);
  assert.deepStrictEqual(times, [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ]);
});
test(`Consume: Consumer is executed first, provider calls are executed first`, () => {
  let pass = true;
  const times = [0, 0, 0, 0];

  new Stream<void>((exchange) => {
    times[0]++;
    const ctb = exchange({ next: () => times[1]++ });
    ctb.next();
  }).consume((exchange) => {
    times[2]++;
    if (times[0]) pass = false;
    const ptb = exchange({
      next() {
        times[3]++;
        if (times[1]) pass = false;
      }
    });
    ptb.next();
  });

  assert(pass);
  assert.deepStrictEqual(times, [1, 1, 1, 1]);
});
test(`Consume: talkbacks are not undefined after exchange execution`, () => {
  new Stream<number, number>((exchange) => {
    const ctb = exchange({ next: () => ctb.complete() });
    ctb.next(1);
  }).consume((exchange) => {
    const ptb = exchange({ next: () => ptb.next(2) });
  });
  new Stream<number, number>((exchange) => {
    const ctb = exchange({ next: () => ctb.next(2) });
  }).consume((exchange) => {
    const ptb = exchange({ next: () => ptb.complete() });
    ptb.next(1);
  });
  new Stream((exchange) => {
    const ctb = exchange({ error: () => ctb.complete() });
    ctb.error(Error('foo'));
  }).consume((exchange) => {
    const ptb = exchange({ error: () => ptb.error(Error('bar')) });
  });
  new Stream((exchange) => {
    const ctb = exchange({ error: () => ctb.error(Error('bar')) });
  }).consume((exchange) => {
    const ptb = exchange({ error: () => ptb.complete() });
    ptb.error(Error('foo'));
  });
  new Stream((exchange) => {
    const ctb = exchange({ complete: () => ctb.complete() });
    ctb.complete();
  }).consume((exchange) => {
    const ptb = exchange({ complete: () => ptb.complete() });
  });
  new Stream((exchange) => {
    const ctb = exchange({ complete: () => ctb.complete() });
  }).consume((exchange) => {
    const ptb = exchange({ complete: () => ptb.complete() });
    ptb.complete();
  });
  new Stream((exchange) => {
    const ctb = exchange({ terminate: () => ctb.terminate() });
    ctb.terminate();
  }).consume((exchange) => {
    const ptb = exchange({ terminate: () => ptb.terminate() });
  });
  new Stream((exchange) => {
    const ctb = exchange({ terminate: () => ctb.terminate() });
  }).consume((exchange) => {
    const ptb = exchange({ terminate: () => ptb.terminate() });
    ptb.terminate();
  });
});
test(`Consume, next: succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  const values: number[] = [];

  let ptb: any;
  let ctb: any;
  new Stream<number, number>((exchange) => {
    ctb = exchange({
      next(value) {
        times[0][0]++;
        values.push(value);
      },
      error: () => times[0][1]++,
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
    ctb.next(1);
  }).consume((exchange) => {
    ptb = exchange({
      next(value) {
        times[1][0]++;
        values.push(value);
        ptb.next(2);
      },
      error: () => times[1][1]++,
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
  });

  assert(!ptb.closed && !ctb.closed);
  assert.deepStrictEqual(times, [
    [1, 0, 0, 0],
    [1, 0, 0, 0]
  ]);
  assert.deepStrictEqual(values, [1, 2]);
});
test(`Consume, error: succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  const values: Error[] = [];

  let ptb: any;
  let ctb: any;
  const errors = [Error('foo'), Error('bar')];
  new Stream((exchange) => {
    ctb = exchange({
      next: () => times[0][0]++,
      error(error) {
        times[0][1]++;
        values.push(error);
      },
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
    ctb.error(errors[0]);
  }).consume((exchange) => {
    ptb = exchange({
      next: () => times[1][0]++,
      error(error) {
        times[1][1]++;
        values.push(error);
        ptb.error(errors[1]);
      },
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
  });

  assert(!ptb.closed && !ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 1, 0, 0],
    [0, 1, 0, 0]
  ]);
  assert.deepStrictEqual(values, errors);
});
test(`Consume, complete: Consumer succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  new Stream((exchange) => {
    ctb = exchange({
      next: () => times[0][0]++,
      error: () => times[0][1]++,
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
    ctb.complete();
  }).consume((exchange) => {
    ptb = exchange({
      next: () => times[1][0]++,
      error: () => times[1][1]++,
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
  });

  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]);
});
test(`Consume, complete: Provider succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  new Stream((exchange) => {
    ctb = exchange({
      next: () => times[0][0]++,
      error: () => times[0][1]++,
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
  }).consume((exchange) => {
    ptb = exchange({
      next: () => times[1][0]++,
      error: () => times[1][1]++,
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
    ptb.complete();
  });

  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 1, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 1, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, terminate: Consumer succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  new Stream((exchange) => {
    ctb = exchange({
      next: () => times[0][0]++,
      error: () => times[0][1]++,
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
    ctb.terminate();
    ctb.complete();
    ctb.terminate();
  }).consume((exchange) => {
    ptb = exchange({
      next: () => times[1][0]++,
      error: () => times[1][1]++,
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
  });

  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, terminate: Provider succeeds`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  new Stream((exchange) => {
    ctb = exchange({
      next: () => times[0][0]++,
      error: () => times[0][1]++,
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
  }).consume((exchange) => {
    ptb = exchange({
      next: () => times[1][0]++,
      error: () => times[1][1]++,
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
    ptb.terminate();
    ptb.complete();
    ptb.terminate();
  });

  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, next: handles exceptions when Talkback.error exists`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  const values: Error[] = [];

  let ptb: any;
  let ctb: any;
  const errors = [Error('foo'), Error('bar')];
  new Stream<void>((exchange) => {
    ctb = exchange({
      next() {
        times[0][0]++;
        throw errors[1];
      },
      error(error) {
        times[0][1]++;
        values.push(error);
      },
      complete: () => times[0][2]++,
      terminate: () => times[0][3]++
    });
    ctb.next();
  }).consume((exchange) => {
    ptb = exchange({
      next() {
        times[1][0]++;
        throw errors[0];
      },
      error(error) {
        times[1][1]++;
        values.push(error);
      },
      complete: () => times[1][2]++,
      terminate: () => times[1][3]++
    });
    ptb.next();
  });

  assert(!ptb.closed && !ctb.closed);
  assert.deepStrictEqual(times, [
    [1, 1, 0, 0],
    [1, 1, 0, 0]
  ]);
  assert.deepStrictEqual(values, errors);
});
test(`Consume, next: Consumer throws and terminates on exeption if there's no error handler`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('foo');

  let value: any;
  try {
    new Stream<void>((exchange) => {
      ctb = exchange({
        next() {
          times[0][0]++;
          throw error;
        },
        error: () => times[0][1]++,
        complete: () => times[0][2]++,
        terminate: () => times[0][3]++
      });
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        complete: () => times[1][2]++,
        terminate: () => times[1][3]++
      });
      ptb.next();
    });
  } catch (err) {
    value = err;
  }

  assert(value === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [1, 0, 0, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, next: Provider throws and terminates on exeption if there's no error handler`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('foo');

  let value: any;
  try {
    new Stream<void>((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        complete: () => times[0][2]++,
        terminate: () => times[0][3]++
      });
      ctb.next();
    }).consume((exchange) => {
      ptb = exchange({
        next() {
          times[1][0]++;
          throw error;
        },
        error: () => times[1][1]++,
        complete: () => times[1][2]++,
        terminate: () => times[1][3]++
      });
    });
  } catch (err) {
    value = err;
  }

  assert(value === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [1, 0, 0, 1]
  ]);
});
test(`Consume, error: Consumer exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error: () => times[0][1]++,
        complete: () => times[1][2]++,
        terminate() {
          times[0][3]++;
          throw Error();
        }
      });
      ctb.error(error);
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error(error) {
          times[1][1]++;
          throw error;
        },
        complete: () => times[1][2]++,
        terminate() {
          times[1][3]++;
          throw Error();
        }
      });
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 1, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 1, 0, 1]
  ]);
});
test(`Consume, error: Provider exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error(error) {
          times[0][1]++;
          throw error;
        },
        complete: () => times[1][2]++,
        terminate() {
          times[0][3]++;
          throw Error();
        }
      });
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error: () => times[1][1]++,
        complete: () => times[1][2]++,
        terminate() {
          times[1][3]++;
          throw Error();
        }
      });
      ptb.error(error);
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 1, 0, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 1, 0, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, complete: Consumer exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error: () => times[0][1]++,
        complete: () => times[0][2]++,
        terminate() {
          times[0][3]++;
          throw Error();
        }
      });
      ctb.complete();
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error: () => times[1][1]++,
        complete() {
          times[1][2]++;
          throw error;
        },
        terminate() {
          times[1][3]++;
          throw Error();
        }
      });
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]);
});
test(`Consume, complete: Provider exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error: () => times[0][1]++,
        complete() {
          times[0][2]++;
          throw error;
        },
        terminate() {
          times[0][3]++;
          throw Error();
        }
      });
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error: () => times[1][1]++,
        complete: () => times[1][2]++,
        terminate() {
          times[1][3]++;
          throw Error();
        }
      });
      ptb.complete();
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 1, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 1, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, terminate: Consumer exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error: () => times[0][1]++,
        complete: () => times[0][2]++,
        terminate() {
          times[0][3]++;
          throw Error();
        }
      });
      ctb.terminate();
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error: () => times[1][1]++,
        complete: () => times[1][2]++,
        terminate() {
          times[1][3]++;
          throw error;
        }
      });
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);
});
test(`Consume, terminate: Provider exceptions throw`, () => {
  const times = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let ptb: any;
  let ctb: any;
  const error = Error('baz');
  let thrown: any;

  try {
    new Stream((exchange) => {
      ctb = exchange({
        next: () => times[0][0]++,
        error: () => times[0][1]++,
        complete: () => times[0][2]++,
        terminate() {
          times[0][3]++;
          throw error;
        }
      });
    }).consume((exchange) => {
      ptb = exchange({
        next: () => times[1][0]++,
        error: () => times[1][1]++,
        complete: () => times[1][2]++,
        terminate() {
          times[1][3]++;
          throw Error();
        }
      });
      ptb.terminate();
    });
  } catch (err) {
    thrown = err;
  }

  assert(thrown === error);
  assert(ptb.closed && ctb.closed);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);

  const errors = [Error('foo'), Error('bar')];
  const values = [];
  ctb.next();
  ptb.next();
  ctb.complete();
  ptb.complete();
  ctb.terminate();
  ptb.terminate();
  try {
    ctb.error(errors[0]);
  } catch (err) {
    values.push(err);
  }
  try {
    ptb.error(errors[1]);
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, errors);
  assert.deepStrictEqual(times, [
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ]);
});
