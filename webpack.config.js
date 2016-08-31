var NODE_ENV = process.env.NODE_ENV || 'development';
module.exports = require('./webpack/' + NODE_ENV + '.config.js');