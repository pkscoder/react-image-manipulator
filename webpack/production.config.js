var path = require('path');
const UglifyJSPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const baseConfig = require('./base.config');
const _ = require('lodash');

module.exports = _.assign({}, baseConfig.commons, {
  entry: {
    ImageEditor: './components/ImageEditor.js',
  },
  output: {
    path: path.resolve(__dirname, '..', 'lib'),
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'ImageManipulator',
  },
  plugins: baseConfig.plugins.concat([
    new CleanWebpackPlugin(['lib/*'], {
      root: path.resolve(__dirname, '..'),
    }),
    new UglifyJSPlugin({
      compress: {
        warnings: false,
      },
    }),
  ]),
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
    {
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
    },
  ],
});
