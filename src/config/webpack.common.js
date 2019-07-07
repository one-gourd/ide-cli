const paths = require('./paths');
const { getExternal, getAlias } = require('./webpack-helper');

const commontConfig = {
  entry: {
    index: './src/index.tsx',
    demo: './demo/demo.tsx'
  },
  node: {
    fs: 'empty'
  },
  externals: getExternal([]),
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
  resolve: Object.assign(
    {
      extensions: ['.tsx', '.ts', '.js']
    },
    (process.env.NODE_ENV = 'production' ? {} : getAlias())
  )
};

const normalConfig = Object.assign({}, commontConfig, {
  output: {
    filename: '[name].js',
    path: paths.appDist
  }
});

module.exports = [normalConfig];