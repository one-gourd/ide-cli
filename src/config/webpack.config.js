const devConfig = require('./webpack.dev');
const prodConfig = require('./webpack.prod');
const ghPageConfig = require('./webpack.gh-pages');

module.exports = function(webpackEnv) {
  switch (webpackEnv) {
    case 'development':
      return devConfig;
    case 'production':
      return prodConfig;
    default:
      break;
  }
};
