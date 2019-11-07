const devConfig = require('./webpack.dev');
const electronMainConfig = require('./webpack.electron.main');
const prodConfig = require('./webpack.prod');
const ghPageConfig = require('./webpack.gh-pages');

module.exports = function(webpackEnv) {
  switch (webpackEnv) {
    case 'development':
      return devConfig; //.concat(withElectron ? electronMainConfig : []);
    case 'production':
      return prodConfig; //.concat(withElectron ? electronMainConfig : []);
    default:
      break;
  }
};
