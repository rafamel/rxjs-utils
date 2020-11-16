/* eslint-disable no-console */
import { Observable } from '@push';
import { Observable as ESObservable } from './module';
import compliance from './compliance';
import chalk from 'chalk';

console.log(chalk.bold('\nCOMPLIANCE'));
let pass = true;
[
  () => compliance('ES Observable', ESObservable, 'final'),
  () => compliance('Observable', Observable, 'each')
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
