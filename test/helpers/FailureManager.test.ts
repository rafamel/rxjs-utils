import assert from 'assert';
import { FailureManager, Handler } from '../../src/helpers';

test(`prototype.replete: is not initially replete`, () => {
  const instance = new FailureManager(() => undefined);

  assert(!instance.replete);
});
test(`prototype.replete: is not replete after prototype.fail if onFail doesn't throw`, () => {
  const instance = new FailureManager(() => undefined);
  instance.fail(Error());

  assert(!instance.replete);
});
test(`prototype.replete: is replete after prototype.fail if onFail throws`, () => {
  const instance = new FailureManager((err) => {
    throw err;
  });
  instance.fail(Error());

  assert(instance.replete);
});
test(`prototype.replete: is not replete after prototype.fail when raising and onFail throws`, () => {
  const instance = new FailureManager(() => undefined);
  Handler.catches(() => instance.fail(Error(), true));

  assert(!instance.replete);
});
test(`prototype.replete: is replete after raise`, () => {
  const instance = new FailureManager((err) => {
    throw err;
  });
  instance.fail(Error());
  Handler.catches(() => instance.raise());

  assert(instance.replete);
});
test(`prototype.fail: executes onFail`, () => {
  let times = 0;
  const instance = new FailureManager(() => times++);

  instance.fail(Error());
  assert(times === 1);
});
test(`prototype.fail: doesn't execute onFail twice when replete`, () => {
  let times = 0;
  const instance = new FailureManager(() => {
    times++;
    throw Error();
  });

  instance.fail(Error());
  instance.fail(Error());
  assert(times === 1);
});
test(`prototype.fail: executes onFail twice when replete and raising`, () => {
  let times = 0;
  const instance = new FailureManager(() => {
    times++;
    throw Error();
  });

  instance.fail(Error());
  Handler.catches(() => instance.fail(Error(), true));
  assert(times === 2);
});
test(`prototype.fail: doesn't raise if onFail doesn't throw`, () => {
  const instance = new FailureManager(() => undefined);
  instance.fail(Error(), true);
});
test(`prototype.fail: raises if onFail throws`, () => {
  const err = Error('foo');
  const responses: any[] = [];
  const instance = new FailureManager((error) => {
    throw error;
  });

  try {
    instance.fail(err, true);
  } catch (error) {
    responses.push(error);
  }

  assert.deepStrictEqual(responses, [err]);
});
test(`prototype.fail: raises with first error if onFail throws`, () => {
  const instance = new FailureManager((error) => {
    throw error;
  });

  instance.fail(Error());

  const error = Error('foo');
  let value: any;
  try {
    instance.fail(error, true);
  } catch (err) {
    value = err;
  }

  assert(value === error);
});
test(`prototype.raise: doesn't raise if not replete`, () => {
  const instance = new FailureManager(() => undefined);
  instance.raise();
});
test(`prototype.raise: doesn't raise if replete and onFail doesn't throw`, () => {
  const instance = new FailureManager(() => undefined);
  instance.fail(Error());
  instance.raise();
});
test(`prototype.raise: raises if replete and onFail throws`, () => {
  const err = Error('foo');
  const responses: any[] = [];
  const instance = new FailureManager((error) => {
    throw error;
  });

  instance.fail(err);
  try {
    instance.raise();
  } catch (error) {
    responses.push(error);
  }
  try {
    instance.raise();
  } catch (error) {
    responses.push(error);
  }
  try {
    instance.raise();
  } catch (error) {
    responses.push(error);
  }

  assert.deepStrictEqual(responses, [err, err, err]);
});
test(`prototype.raise: raises after fail raises when onFail throws`, () => {
  const err = Error('foo');
  const responses: any[] = [];
  const instance = new FailureManager((error) => {
    throw error;
  });

  try {
    instance.fail(err, true);
  } catch (error) {
    responses.push(error);
  }
  try {
    instance.raise();
  } catch (error) {
    responses.push(error);
  }
  try {
    instance.raise();
  } catch (error) {
    responses.push(error);
  }

  assert.deepStrictEqual(responses, [err, err, err]);
});
test(`complete usage flow succeeds`, () => {
  const errors = [Error('foo'), Error('bar')];
  const values = [];

  const instance = new FailureManager((error) => {
    throw error;
  });

  try {
    instance.fail(errors[0], true);
  } catch (err) {
    values.push(err);
  }

  assert(instance.replete);

  instance.fail(Error());

  try {
    instance.fail(errors[1], true);
  } catch (err) {
    values.push(err);
  }

  instance.fail(Error());

  try {
    instance.raise();
  } catch (err) {
    values.push(err);
  }

  try {
    instance.fail(errors[1], true);
  } catch (err) {
    values.push(err);
  }

  try {
    instance.raise();
  } catch (err) {
    values.push(err);
  }

  assert.deepStrictEqual(values, [
    errors[0],
    errors[1],
    errors[0],
    errors[1],
    errors[0]
  ]);
});
