/* eslint-disable no-console */
import { Observable } from './module';
import { runTests } from './module/tests';
import chalk from 'chalk';

es();
function es(): void {
  const log = console.log.bind(console);
  console.log = (): void => undefined;

  log();
  runTests(Observable)
    .then(({ logger }) => {
      if (!logger.failed) {
        log(chalk.bgGreen.black(' PASS ') + ` ES Observable compliance\n`);
        console.log = log;
      } else {
        log(
          chalk.bgRed.black(' FAIL ') +
            ` ES Observable compliance: ${logger.failed}\n`
        );
        process.exit(1);
      }
    })
    .catch((err) => {
      log(
        chalk.bgRed.black(' FAIL ') +
          ` ES Observable compliance error: ${err.message}\n`
      );
      process.exit(1);
    });
}
