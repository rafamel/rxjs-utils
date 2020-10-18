/* eslint-disable no-console */
// @ts-ignore
import { runTests as compliance } from 'es-observable-tests';
import { Observable } from '../src';

test(`Observables complies w/ ES Observable spec`, async () => {
  const log = console.log;
  console.log = (...value: any[]) =>
    process.stdout.write(value.join(' ') + '\n');
  const { logger } = await compliance(Observable);
  console.log = log;

  expect(logger.failed).toBe(0);
});
