/* eslint-disable no-console */
import { Observable as ESObservable } from './module';
import { Observable as ReferenceObservable } from './reference';
import { PushStream } from '../../src';
import chalk from 'chalk';
import compliance from './compliance';

console.log(chalk.bold('\nCOMPLIANCE'));
let pass = true;
[
  () => compliance('ES Observable', ESObservable, 'final'),
  () => compliance('Reference Observable', ReferenceObservable, 'final'),
  () => compliance('Multitude PushStream', PushStream, 'each')
]
  .reduce((acc, item) => {
    return acc.then(item).then((result) => {
      pass = pass && !result.result[1].length;
    });
  }, Promise.resolve())
  .then(() => {
    if (!pass) process.exit(1);
    console.log();
  });
