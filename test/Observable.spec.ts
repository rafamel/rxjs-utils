/* eslint-disable no-console */
// @ts-ignore
import { runTests as compliance } from 'es-observable-tests';
import { Observable } from '../src';

function setup(fn: () => Promise<void>): Promise<void> {
  const log = console.log;
  console.log = (...value: any[]) =>
    process.stdout.write(value.join(' ') + '\n');
  return fn().finally(() => (console.log = log));
}

test(`Observable complies w/ ES Observable spec`, async () => {
  await setup(async () => {
    const { logger } = await compliance(Observable);
    expect(logger.failed).toBe(0);
    expect(logger.errored).toBe(0);
  });
});
