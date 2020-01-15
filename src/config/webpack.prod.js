const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const path = require('path');
const { getExternal, getAlias } = require('./webpack-helper');
const { pick } = require('../lib/util');
const paths = require('./paths');
const {
  libName,
  prodWithProxy,
  fullPackageMode,
  fullPackageExternals = []
} = require(paths.ideConfig);

// const isDebug = process.env.DEBUG === 'true';
console.log('prodWithProxy: ', prodWithProxy);
console.log('fullPackageMode: ', fullPackageMode);

let externalsConfig = getExternal(true); // 默认打包时，尽可能 externals 公共包

const buildConfig = common.map(config => {
  /* 这份配置是用于引入到浏览器中时候用的
     比如 https://unpkg.com/ide-context-menu@0.1.2/dist/index.umd.js
  */
  return merge(config, {
    entry: './src/index.tsx',
    externals: externalsConfig,
    mode: 'production',
    devtool: 'source-map',
    ...(prodWithProxy ? { resolve: getAlias() } : {}),

    optimization: {
      minimizer: [new TerserPlugin()]
    },
    plugins: [
      // new CleanWebpackPlugin(paths.appDist),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ],
    output: {
      filename: 'index.umd.js',
      libraryTarget: 'umd',
      library: libName,
      path: paths.appDist,
      umdNamedDefine: true
    }
  });
});

if (fullPackageMode) {
  // 如果是完整打包模式，只挑选其中的 fullPackageExternals 指定的包（子集）
  externalsConfig = pick(externalsConfig, fullPackageExternals);

  console.log('开启【完整打包模式】, 此时 externals 列表：', externalsConfig);
  buildConfig.forEach(curConfig => {
    curConfig.externals = externalsConfig;
  });
}


module.exports = buildConfig;
