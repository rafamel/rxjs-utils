const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  test: 'kpo test:perf test:spec test:jest --',
  'test:perf': 'babel-node -x .js,.ts ./test/es-observable/performance',
  'test:spec': 'babel-node -x .js,.ts ./test/es-observable/specification',
  'test:jest': scripts.test,

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
