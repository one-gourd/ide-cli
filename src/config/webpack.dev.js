const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getAlias } = require('./webpack-helper');

const paths = require('./paths');
const {
  name,
  disableDemoEntry,
  withElectron,
  htmlPlugin = {}
} = require(paths.ideConfig);
// const paths = require('./paths');
// const { withElectron } = require(paths.ideConfig);

// const targetDir = 'dist';

const {
  template = 'demo/index.html',
  title = name,

  // 自定义插入位置：https://github.com/jantimon/html-webpack-plugin/blob/master/examples/custom-insertion-position/readme.md ，配合使用 <%= htmlWebpackPlugin.tags.bodyTags %>
  inject = true
} = htmlPlugin;

module.exports = common.map(config => {
  const result = merge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    target: withElectron ? 'electron-renderer' : 'web',
    resolve: getAlias(),
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {
            title,
            // Load a custom template (lodash by default)
            template: template,
            inject
          },
          disableDemoEntry ? {} : { excludeChunks: ['index', 'index.js'] }
        )
      ),
      new webpack.HotModuleReplacementPlugin(), // enable HMR globally
      new webpack.NamedModulesPlugin() // prints more readable module names in the browser console on HMR updates
    ]
  });

  console.log('resolve:', result.resolve);

  return result;
});
