const {merge} = require('webpack-merge');
const { common, workboxPluginConfig } = require('./webpack.common.js');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getAlias } = require('./webpack-helper');

const paths = require('./paths');
const {
  name,
  disableDemoEntry,
  withElectron,
  publicPath,
  htmlPlugin = {}
} = require(paths.ideConfig);

const { version } = require(paths.appPackageJson);
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
    optimization: {
      moduleIds: 'named', // prints more readable module names in the browser console on HMR updates
    },
    plugins: [
      ...workboxPluginConfig,
      new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(version),
        __PUBLIC_PATH__: JSON.stringify(publicPath || ''),
      }),
      new HtmlWebpackPlugin(
        Object.assign(
          {
            title,
            // Load a custom template (lodash by default)
            template: template,
            inject,
          },
          disableDemoEntry ? {} : { excludeChunks: ['index', 'index.js'] }
        )
      ),
      new webpack.HotModuleReplacementPlugin(), // enable HMR globally
      new ForkTsCheckerWebpackPlugin(),
    ],
  });

  console.log('resolve:', result.resolve);

  return result;
});
