/* eslint-disable no-console */
import { runTests } from './module/tests';
import { PushStream } from '../../src';

function setup(fn: () => Promise<void>): Promise<void> {
  const log = console.log;
  console.log = (...value: any[]) =>
    process.stdout.write(value.join(' ') + '\n');
  return fn().finally(() => (console.log = log));
}

test(`PushStream complies w/ ES Observable spec`, async () => {
  await setup(async () => {
    await expect(
      runTests(PushStream).then(({ logger }) => logger.failed)
    ).resolves.toBe(0);
  });
});
