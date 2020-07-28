const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  build: [
    scripts.build,
    kpo.json('./pkg/package.json', ({ json }) => ({
      ...json,
      files: [...json.files, 'operators/']
    })),
    kpo.json('./pkg/react/package.json', () => ({
      sideEffects: false,
      name: 'multitude/operators',
      main: '../dist/operators/index.js',
      types: '../dist/operators/index.d.ts',
      esnext: '../dist-src/operators/index.js'
    })),
    kpo.series('npm pack', { cwd: './pkg' })
  ],
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  docs: [scripts.docs, kpo.kpo`docs:uml`],
  'docs:uml': [
    'puml generate assets/Definitions.puml -o assets/Definitions.png',
    'puml generate assets/Consume.puml -o assets/Consume.png'
  ],

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
