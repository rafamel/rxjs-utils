import assert from 'assert';
import { Handler } from '../../src/helpers';

test(`Handler.noop`, () => {
  assert(Handler.noop() === undefined);
});
test(`Handler.catches`, () => {
  Handler.catches(() => {
    throw Error();
  });
});
test(`Handler.throws`, () => {
  const err = Error('foo');
  let res: any;
  try {
    Handler.throws(err);
  } catch (error) {
    res = error;
  }

  assert(res === err);
});
