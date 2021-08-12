const {merge} = require('webpack-merge');
const { common, workboxPluginConfig } = require('./webpack.common.js');
const webpack = require('webpack');
const fs = require('fs');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
// const path = require('path');
const { getExternal, getAlias } = require('./webpack-helper');
const { pick } = require('../lib/util');
const paths = require('./paths');
const {
  libName,
  publicPath,
  prodWithProxy,
  fullPackageMode = false,
  fullPackageExternals = []
} = require(paths.ideConfig);
const { version } = require(paths.appPackageJson);

// const isDebug = process.env.DEBUG === 'true';
console.log('prodWithProxy: ', prodWithProxy);
console.log('fullPackageMode: ', fullPackageMode);

let externalsConfig = getExternal(true); // 默认打包时，尽可能 externals 公共包

// console.log('externals: ', externalsConfig);
// 兼容 publicPath 是对象的形式

const buildConfig = common.map(config => {
  /* 这份配置是用于引入到浏览器中时候用的
     比如 https://unpkg.com/ide-context-menu@0.1.2/dist/index.umd.js
  */
  return merge(config, {
    entry: './src/index',
    externals: externalsConfig,
    mode: 'production',
    devtool: 'source-map',
    ...(prodWithProxy ? { resolve: getAlias() } : {}),

    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      ...workboxPluginConfig,
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        __VERSION__: JSON.stringify(version),
        __PUBLIC_PATH__: JSON.stringify(publicPath || ''),
      }),
      // new ForkTsCheckerWebpackPlugin(),
    ],
    output: {
      filename: 'index.umd.js',
      libraryTarget: 'umd',
      chunkFilename: '[name].bundle.js', // 非 entry 部分使用该命名法则
      library: libName,
      path: paths.appDist,
      publicPath: publicPath || '',
      umdNamedDefine: true,
    },
  });
});

// 默认只有一份动态加载的 js 脚本，可以指定常规非动态脚本加载方式
// 但如果存在 `index.dynamic.tsx` 文件，将同时新增一份非动态加载文件
if (fs.existsSync(paths.appDynamicIndex)) {
  console.log(
    '探测到 index.dynamic.tsx 文件存在，将额外打包一份支持动态加载的入口文件'
  );
  // const secondConfig = Object.assign({}, buildConfig[0]);
  buildConfig[0].entry = {
    index: './src/index.tsx',
    'index.dynamic': './src/index.dynamic.tsx'
  };

  // 如果有 deps.ts 文件，需要生成依赖文件
  if (fs.existsSync(paths.appDepsFile)) {
    console.log('探测到 deps.tsx 文件存在，将额外打包一份依赖文件');
    buildConfig[0].entry.deps = './src/deps.ts';
  }

  buildConfig[0].output.filename = '[name].umd.js';
}
// console.log(999, buildConfig);

if (fullPackageMode) {
  // 如果是完整打包模式，只挑选其中的 fullPackageExternals 指定的包（子集）
  externalsConfig = pick(externalsConfig, fullPackageExternals);

  console.log('开启【完整打包模式】, 此时 externals 列表：', externalsConfig);
  buildConfig.forEach(curConfig => {
    curConfig.externals = externalsConfig;
  });
}

module.exports = buildConfig;
