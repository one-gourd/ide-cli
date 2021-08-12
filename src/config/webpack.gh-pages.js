const { merge } = require('webpack-merge');
const { common } = require('./webpack.common.js');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getExternal } = require('./webpack-helper');
const paths = require('./paths');
const { name, libName } = require(paths.ideConfig);

module.exports = common.map(config => {
  /* 这份配置是用于发布 demo 到 gh-pages 分支使用的  */
  return merge(config, {
    entry: './demo/demo.tsx',
    externals: getExternal(true),
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: name,
        excludeChunks: ['index', 'index.js'],
        // Load a custom template (lodash by default)
        template: 'demo/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      new ForkTsCheckerWebpackPlugin(),
    ],
    output: {
      filename: 'demo.js',
      path: paths.appPublic,
      libraryTarget: 'umd',
      library: libName,
      umdNamedDefine: true,
    },
  });
});
