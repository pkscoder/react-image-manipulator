const path = require('path');
const baseConfig = require('./base.config');
const _ = require('lodash');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

module.exports = _.assign({}, baseConfig.commons, {
  devtool: 'source-map',
  entry: ['webpack-dev-server/client?http://localhost:2000', 'webpack/hot/only-dev-server', './test/test'],
  output: {
    path: path.resolve(__dirname, '..', 'test'),
    filename: 'test.compiled.js',
  },
  plugins: baseConfig.plugins.concat([
    new HotModuleReplacementPlugin(),
  ]),
});
