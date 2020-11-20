/* eslint-disable no-console */
import { Create, Observable, PushStream } from '@push';
import { Handler } from '@helpers';
import { Observable as ESObservable } from './module';
import { compliance } from './compliance';
import chalk from 'chalk';

const StreamConstructor: any = PushStream;
StreamConstructor.of = Create.of;
StreamConstructor.from = Create.from;
process.on('unhandledRejection', Handler.noop);

console.log(chalk.bold('\nCOMPLIANCE'));
let pass = true;
[
  () => compliance('ES Observable', ESObservable, 'final', true),
  () => compliance('Observable', Observable, 'final', true),
  () => compliance('PushStream', StreamConstructor, 'each', false)
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
