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
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build'],

  /* Build */
  build: [
    scripts.build,
    kpo.json('./pkg/package.json', ({ json }) => ({
      ...json,
      files: [...json.files, 'definitions/', 'pull/', 'push/']
    })),
    kpo.json('./pkg/definitions/package.json', () => ({
      sideEffects: false,
      name: 'multitude/definitions',
      main: '../dist/definitions/index.js',
      types: '../dist/definitions/index.d.ts',
      esnext: '../dist-src/definitions/index.js'
    })),
    kpo.json('./pkg/pull/package.json', () => ({
      sideEffects: false,
      name: 'multitude/pull',
      main: '../dist/pull/index.js',
      types: '../dist/pull/index.d.ts',
      esnext: '../dist-src/pull/index.js'
    })),
    kpo.json('./pkg/push/package.json', () => ({
      sideEffects: false,
      name: 'multitude/push',
      main: '../dist/push/index.js',
      types: '../dist/push/index.d.ts',
      esnext: '../dist-src/push/index.js'
    })),
    kpo.series('npm pack', { cwd: './pkg' })
  ]
};
