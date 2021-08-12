const paths = require('./paths');
const { getExternal } = require('./webpack-helper');
const { InjectManifest } = require('workbox-webpack-plugin');

const {
  disableDemoEntry,
  workbox,
  workboxConfig = {},
  configFileName = 'tsconfig.json',
} = require(paths.ideConfig);


console.log('使用 TS 配置文件名:' + configFileName);


const workboxPluginConfig = workbox
  ? [
      new InjectManifest({
        swSrc: './sw.js',
        swDest: 'sw.js',
        // 忽略 d.ts 的缓存
        exclude: [/\.d\.ts$/],
        ...workboxConfig,
      }),
    ]
  : [];

const commontConfig = {
  entry: Object.assign(
    {
      index: './src/index',
    },
    disableDemoEntry ? {} : { demo: './demo/demo' }
  ),
  externals: getExternal(),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('ts-loader'),
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: false,
          configFile: configFileName,
          projectReferences: true,
        },
        exclude: /node_modules/,
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: require.resolve('source-map-loader'),
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          { loader: 'css-loader', options: { importLoaders: 1 } },
        ],
      },
    ],
  },
  resolve: Object.assign({
    extensions: ['.tsx', '.ts', '.js'],
  }),
};

const normalConfig = Object.assign({}, commontConfig, {
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js', // 非 entry 模块使用该命名方式
    path: paths.appDist
  }
});

module.exports = {
  common: [normalConfig],
  workboxPluginConfig,
};
