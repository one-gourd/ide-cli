const paths = require('./paths');
const { getExternal } = require('./webpack-helper');

const { disableDemoEntry } = require(paths.ideConfig);

const commontConfig = {
  entry: Object.assign(
    {
      index: './src/index'
    },
    disableDemoEntry ? {} : { demo: './demo/demo' }
  ),
  node: {
    fs: 'empty'
  },
  externals: getExternal(),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('awesome-typescript-loader'),

        exclude: /node_modules/
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: require.resolve('source-map-loader')
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          { loader: 'css-loader', options: { importLoaders: 1 } }
        ]
      }
    ]
  },
  resolve: Object.assign({
    extensions: ['.tsx', '.ts', '.js']
  })
};

const normalConfig = Object.assign({}, commontConfig, {
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js', // 非 entry 模块使用该命名方式
    path: paths.appDist
  }
});

module.exports = [normalConfig];
