import { Handler } from '@helpers';
import assert from 'assert';

test(`Handler.noop`, () => {
  assert(Handler.noop() === undefined);
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
