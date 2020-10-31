/* eslint-disable no-console */
import { Observables, Observable, PushStream } from '../src';
import ZenObservable from 'zen-observable';
import chalk from 'chalk';

console.log(chalk.bold('\nPERFORMANCE'));
const failures = [
  performs(
    ['Multitude PushStream', PushStream],
    ['Zen Observable', ZenObservable],
    100,
    10 ** 5,
    0.1
  ),
  performs(
    ['Multitude Observable', Observable],
    ['Zen Observable', ZenObservable],
    100,
    10 ** 5,
    0.1
  )
].filter((success) => !success);

if (failures.length) process.exit(1);

function performs(
  local: [string, any],
  reference: [string, any],
  times: number,
  count: number,
  alpha: number
): boolean {
  const [name, Constructor] = local;
  const [referenceName, ReferenceConstructor] = reference;

  function run(Observable: any): number {
    const start = Date.now();

    new Observable((obs: Observables.SubscriptionObserver<void>) => {
      for (let i = 0; i < count; i++) {
        obs.next();
      }
      obs.complete();
    }).subscribe(() => undefined);

    return Date.now() - start;
  }

  let msReference = 0;
  let ms = 0;

  for (let i = 0; i <= times - 1; i++) {
    ms += run(Constructor);
    msReference += run(ReferenceConstructor);
  }

  let prefix: string;
  let msg: string;

  if (ms <= msReference) {
    prefix = chalk.bgGreen.black(' PASS ');
    msg = `${name} [${ms} ms] <= ${referenceName} [${msReference} ms]`;
  } else if (ms <= msReference * (1 + alpha)) {
    prefix = chalk.bgBlue.black(' PASS ');
    msg = `${name} [${ms} ms] ~= ${referenceName} [${msReference} ms]`;
  } else {
    prefix = chalk.bgRed.black(' FAIL ');
    msg = `${name} [${ms} ms] > ${referenceName} [${msReference} ms]`;
  }

  console.log(prefix + ' ' + chalk.bold(msg));

  return ms <= msReference * (1 + alpha);
}
