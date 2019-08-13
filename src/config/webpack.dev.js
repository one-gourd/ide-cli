const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getAlias } = require('./webpack-helper');

const paths = require('./paths');
const { name, disableDemoEntry } = require(paths.ideConfig);

// const targetDir = 'dist';

module.exports = common.map(config => {
  const result = merge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: getAlias(),
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {
            title: name,
            // Load a custom template (lodash by default)
            template: 'demo/index.html'
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
