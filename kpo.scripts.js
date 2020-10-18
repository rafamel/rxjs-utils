const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  test: 'kpo test:jest test:observable',
  'test:jest': scripts.test,
  'test:observable': ['kpo build', 'node test/test.observable'],

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
