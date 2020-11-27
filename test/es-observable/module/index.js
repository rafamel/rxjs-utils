require('@babel/register')({
  ignore: [],
  include: ['./node_modules/es-observable'],
  plugins: ['transform-es2015-modules-commonjs'],
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts'],
  cache: false
});

const { Observable } = require('es-observable/src/Observable');
module.exports = { ESObservable: Observable };
