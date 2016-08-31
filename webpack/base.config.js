const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  commons: {
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['es2015', 'stage-0', 'react'],
            plugins: ['add-module-exports', 'transform-class-properties'],
          },
          exclude: /node_modules/,
        }, {
          test: /\.json$/,
          loader: 'json-loader',
        }, {
          test: /\.png$/,
          loader: 'url-loader?limit=100000&mimetype=image/png',
        }, {
          test: /(\.scss|\.css)$/,
          include: /components/,
          loader: 'style!css!sass',
        },
      ],
    },
    resolve: {
      extensions: ['', '.scss', '.js', '.json', '.png'],
      modulesDirectories: [
        'node_modules',
        'components',
      ],
    },
  },
  plugins: [
    new WebpackNotifierPlugin({
      title: 'Image Manipulator',
    })
  ],
};
