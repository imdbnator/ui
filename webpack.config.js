/*
Notes
  - Detailed webpack configration can be found in the documentation: https://webpack.js.org/configuration/
  - `webpack -p` same as UglifyJS with process.env.NODE_ENV == 'production' (https://webpack.js.org/guides/production/)
 */

const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

config = {
  context: path.resolve(__dirname, 'js'),
  entry: {
    main: './main.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    publicPath: '/assets/',
    filename: 'js/[name].bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-0'],
        plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties', 'transform-runtime']
      }
    }]
  },
  plugins: (process.env.NODE_ENV === 'production') ? [
     new webpack.optimize.OccurrenceOrderPlugin(),
     new webpack.optimize.UglifyJsPlugin()
   ] : [
     new BundleAnalyzerPlugin()
   ],
  devServer: {
    // host: '192.168.0.6',
    port: 3000,
    contentBase: __dirname,
    inline: true,
    compress: true,
    hot: true,
    historyApiFallback: true
  },
  resolve: {
    alias: {
      pages: path.resolve(__dirname, 'js/pages/'),
      components: path.resolve(__dirname, 'js/components/'),
      actions: path.resolve(__dirname, 'js/redux/actions/'),
      store: path.resolve(__dirname, 'js/redux/store/'),
      reducers: path.resolve(__dirname, 'js/redux/reducers/'),
      modules: path.resolve(__dirname, 'js/modules/'),
      samples: path.resolve(__dirname, 'js/samples/'),
      utils: path.resolve(__dirname, 'js/utils/')
    },
    extensions: ['.js', '.jsx', '.json']
  }
}

// Set Global variables
config.plugins.push(new webpack.DefinePlugin({
  'process.env': {NODE_ENV: process.env.NODE_ENV},
  API_HOST: JSON.stringify('localhost:8081')
}))

module.exports = config
