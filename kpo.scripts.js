const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  test: 'kpo test:jest test:es test:perf --',
  'test:jest': scripts.test,
  'test:es': 'babel-node -x .js,.ts ./test/es-observable/es-compliance',
  'test:perf': 'babel-node -x .js,.ts ./test/es-observable/performance',
  'test:spec': 'kpo test:es test:jest -- ./test/es-observable',

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
