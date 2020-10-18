/* eslint-disable no-console */
const { runTests: test } = require('es-observable-tests');
const { Observable } = require('../pkg');

test(Observable).then(
  ({ logger }) => {
    if (!logger.failed || logger.failed <= 0) return;
    console.log('ERROR: ES Observable compliance tests');
    process.exit(1);
  },
  (error) => {
    console.log(error);
    process.exit(1);
  }
);
