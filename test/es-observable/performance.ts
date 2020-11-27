/* eslint-disable no-console */
import { Push } from '@definitions';
import { Observable } from '@push';
import { ESObservable } from './module';
import chalk from 'chalk';

console.log(chalk.bold('\nPERFORMANCE'));

const successes = [
  performs(
    ['Observable', Observable],
    ['ES Observable', ESObservable],
    100,
    10 ** 5,
    1.25
  )
];

console.log('');
for (const success of successes) {
  if (!success) process.exit(1);
}

function performs(
  local: [string, any],
  reference: [string, any],
  times: number,
  count: number,
  threshold: number
): boolean {
  const [name, Constructor] = local;
  const [referenceName, ReferenceConstructor] = reference;

  function run(Observable: any): number {
    const start = Date.now();

    new Observable((obs: Push.SubscriptionObserver<void>) => {
      for (let i = 0; i < count; i++) {
        obs.next();
      }
      obs.complete();
      return () => undefined;
    }).subscribe(() => undefined);

    return Date.now() - start;
  }

  let msReference = 0;
  let ms = 0;

  for (let i = 0; i <= times - 1; i++) {
    msReference += run(ReferenceConstructor);
    ms += run(Constructor);
  }

  let prefix: string;
  let msg: string;

  if (ms <= msReference) {
    prefix = chalk.bgGreen.black(' PASS ');
    msg = `${name} [${ms} ms] <= ${referenceName} [${msReference} ms]`;
  } else if (ms <= msReference * threshold) {
    prefix = chalk.bgBlue.black(' PASS ');
    msg = `${name} [${ms} ms] ~= ${referenceName} [${msReference} ms]`;
  } else {
    prefix = chalk.bgRed.black(' FAIL ');
    msg = `${name} [${ms} ms] > ${referenceName} [${msReference} ms]`;
  }

  console.log(prefix + ' ' + chalk.bold(msg));

  return ms <= msReference * threshold;
}
