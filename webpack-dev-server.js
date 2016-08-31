#!/usr/bin/env node

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js');

function errorHandler(error) {
  console.log(error);
}

function listenHandler() {
  console.log('Listening on 2000');
}

new WebpackDevServer(webpack(config), {
  publicPath: '/static/',
  historyApiFallback: true,
}).listen(2000, 'localhost', function (err, data) {
  if (err) {
    errorHandler(err);
  }
  listenHandler();
});
