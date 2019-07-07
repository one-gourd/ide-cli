const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = require('./paths');
const { name } = require(paths.ideConfig);

// const targetDir = 'dist';

module.exports = common.map(config => {
  return merge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new HtmlWebpackPlugin({
        title: name,
        excludeChunks: ['index', 'index.js'],
        // Load a custom template (lodash by default)
        template: 'demo/index.html'
      }),
      new webpack.HotModuleReplacementPlugin(), // enable HMR globally
      new webpack.NamedModulesPlugin() // prints more readable module names in the browser console on HMR updates
    ]
  });
});
