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
      files: [
        ...json.files,
        'definitions/',
        'iterables/',
        'observables/',
        'utils/'
      ]
    })),
    kpo.json('./pkg/definitions/package.json', () => ({
      sideEffects: false,
      name: 'multitude/definitions',
      main: '../dist/definitions/index.js',
      types: '../dist/definitions/index.d.ts',
      esnext: '../dist-src/definitions/index.js'
    })),
    kpo.json('./pkg/iterables/package.json', () => ({
      sideEffects: false,
      name: 'multitude/iterables',
      main: '../dist/iterables/index.js',
      types: '../dist/iterables/index.d.ts',
      esnext: '../dist-src/iterables/index.js'
    })),
    kpo.json('./pkg/observables/package.json', () => ({
      sideEffects: false,
      name: 'multitude/observables',
      main: '../dist/observables/index.js',
      types: '../dist/observables/index.d.ts',
      esnext: '../dist-src/observables/index.js'
    })),
    kpo.json('./pkg/utils/package.json', () => ({
      sideEffects: false,
      name: 'multitude/utils',
      main: '../dist/utils/index.js',
      types: '../dist/utils/index.d.ts',
      esnext: '../dist-src/utils/index.js'
    }))
  ]
};
