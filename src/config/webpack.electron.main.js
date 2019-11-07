// const merge = require('webpack-merge');
// const common = require('./webpack.common.js');
// const webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// const { getAlias } = require('./webpack-helper');

const paths = require('./paths');
// const { name, disableDemoEntry } = require(paths.ideConfig);

// const targetDir = 'dist';

module.exports = [
  {
    mode: 'development',
    entry: paths.electronMain,
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }
      ]
    },
    output: {
      path: paths.appDist,
      filename: 'electron.js'
    }
  }
];
