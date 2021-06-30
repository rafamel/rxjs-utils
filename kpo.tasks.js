const {
  recreate,
  context,
  create,
  series,
  lift,
  exec,
  catches,
  write,
  mkdir
} = require('kpo');
const riseup = require('./riseup.config');

const tasks = {
  node: riseup.node,
  build: series(
    riseup.build,
    mkdir(['pkg/definitions', 'pkg/pull', 'pkg/push']),
    write('pkg/definitions/package.json', {
      sideEffects: false,
      name: 'multitude/definitions',
      main: '../dist/definitions/index.js',
      types: '../dist/definitions/index.d.ts',
      esnext: '../dist-src/definitions/index.js'
    }),
    write('pkg/pull/package.json', {
      sideEffects: false,
      name: 'multitude/pull',
      main: '../dist/pull/index.js',
      types: '../dist/pull/index.d.ts',
      esnext: '../dist-src/pull/index.js'
    }),
    write('pkg/push/package.json', {
      sideEffects: false,
      name: 'multitude/push',
      main: '../dist/push/index.js',
      types: '../dist/push/index.d.ts',
      esnext: '../dist-src/push/index.js'
    })
  ),
  docs: riseup.docs,
  fix: riseup.fix,
  lint: series(riseup.lintmd, riseup.lint),
  test: series(
    context({ args: 'test/es-observable/performance' }, riseup.node),
    context({ args: 'test/es-observable/specification' }, riseup.node),
    riseup.test
  ),
  commit: riseup.commit,
  release: context({ args: ['--no-verify'] }, riseup.release),
  distribute: riseup.distribute,
  validate: series(
    create(() => tasks.lint),
    create(() => tasks.test),
    lift({ purge: true, mode: 'audit' }, () => tasks),
    catches({ level: 'silent' }, exec('npm', ['outdated']))
  ),
  /* Hooks */
  prepare: catches(null, exec('simple-git-hooks')),
  version: series(
    create(() => tasks.validate),
    create(() => tasks.build),
    create(() => tasks.docs)
  )
};

module.exports = recreate({ announce: true }, tasks);
