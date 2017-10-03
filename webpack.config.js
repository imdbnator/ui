/*
Notes
  - Detailed webpack configration can be found in the documentation: https://webpack.js.org/configuration/
  - `webpack -p` same as UglifyJS with process.env.NODE_ENV == 'production' (https://webpack.js.org/guides/production/)
 */

const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const env = process.env.NODE_ENV || 'dev'
const api = process.env.API_HOST || 'localhost:8081'
const protocol = process.env.PROTOCOL || 'http://'

console.log('env:', env);
console.log('api:', api);

config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './main.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    publicPath: '/assets/',
    filename: 'src/[name].bundle.js'
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
  plugins: [],
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
      pages: path.resolve(__dirname, 'src/pages/'),
      components: path.resolve(__dirname, 'src/components/'),
      actions: path.resolve(__dirname, 'src/redux/actions/'),
      store: path.resolve(__dirname, 'src/redux/store/'),
      reducers: path.resolve(__dirname, 'src/redux/reducers/'),
      modules: path.resolve(__dirname, 'src/modules/'),
      samples: path.resolve(__dirname, 'src/samples/'),
      utils: path.resolve(__dirname, 'src/utils/')
    },
    extensions: ['.js', '.jsx', '.json']
  }
}

// Set Global variables
config.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(env),
    PROTOCOL: JSON.stringify(protocol),
    API_HOST: JSON.stringify(api)
  },
}))

module.exports = config
