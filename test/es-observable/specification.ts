/* eslint-disable no-console */
import chalk from 'chalk';
import { Observable, configure } from '@push';
import { compliance } from './compliance';
import { ESObservable } from './module';

configure({ onUnhandledError: null });

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
