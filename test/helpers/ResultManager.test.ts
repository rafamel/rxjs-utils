import { ResultManager } from '../../src/helpers';
import assert from 'assert';

test(`prototype.replete is initially false`, () => {
  const instance = new ResultManager();
  assert(!instance.replete);
});
test(`prototype.pass repletes instance`, () => {
  const instance = new ResultManager();
  instance.pass();
  assert(instance.replete);
});
test(`prototype.fail repletes instance`, () => {
  const instance = new ResultManager();
  instance.fail(Error());
  assert(instance.replete);
});
test(`first onPass executes once when prototype.onPass called before prototype.pass`, () => {
  const val = {};
  let res: any;
  let times = 0;

  const instance = new ResultManager<any>();
  instance.onPass((value) => {
    times++;
    res = value;
  });
  instance.onPass(() => times++);
  instance.pass(val);
  instance.onPass(() => times++);
  instance.pass({});

  assert(res === val);
  assert(times === 1);
});
test(`first onPass executes once when prototype.onPass called after prototype.pass`, () => {
  const val = {};
  let res: any;
  let times = 0;

  const instance = new ResultManager<any>();
  instance.pass(val);
  instance.pass({});
  instance.onPass((value) => {
    times++;
    res = value;
  });
  instance.pass({});
  instance.onPass(() => times++);
  instance.pass({});

  assert(res === val);
  assert(times === 1);
});
test(`first onFail executes once when prototype.onFail called before prototype.fail`, () => {
  const err = Error('foo');
  let res: any;
  let times = 0;

  const instance = new ResultManager();
  instance.onFail((error) => {
    times++;
    res = error;
  });
  instance.onFail(() => times++);
  instance.fail(err);
  instance.onFail(() => times++);
  instance.fail(Error());

  assert(res === err);
  assert(times === 1);
});
test(`first onFail executes once when prototype.onFail called after prototype.fail`, () => {
  const err = Error('foo');
  let res: any;
  let times = 0;

  const instance = new ResultManager();
  instance.fail(err);
  instance.fail(Error());
  instance.onFail((error) => {
    times++;
    res = error;
  });
  instance.fail(Error());
  instance.onFail(() => times++);
  instance.fail(Error());

  assert(res === err);
  assert(times === 1);
});
test(`onPass never executes on fail when registered before`, () => {
  const times = [0, 0];

  const instance = new ResultManager();
  instance.onPass(() => times[0]++);
  instance.onFail(() => times[1]++);
  instance.fail(Error());
  instance.pass();

  assert.deepStrictEqual(times, [0, 1]);
});
test(`onPass never executes on fail when registered after`, () => {
  const times = [0, 0];

  const instance = new ResultManager();
  instance.fail(Error());
  instance.pass();
  instance.onPass(() => times[0]++);
  instance.onFail(() => times[1]++);

  assert.deepStrictEqual(times, [0, 1]);
});
test(`onFail never executes on pass when registered before`, () => {
  const times = [0, 0];

  const instance = new ResultManager();
  instance.onFail(() => times[1]++);
  instance.onPass(() => times[0]++);
  instance.pass();
  instance.fail(Error());

  assert.deepStrictEqual(times, [1, 0]);
});
test(`onFail never executes on pass when registered after`, () => {
  const times = [0, 0];

  const instance = new ResultManager();
  instance.pass();
  instance.fail(Error());
  instance.onFail(() => times[1]++);
  instance.onPass(() => times[0]++);

  assert.deepStrictEqual(times, [1, 0]);
});
