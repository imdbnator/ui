const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// Detailed webpack configration can be found in the documentation: https://webpack.js.org/configuration/
module.exports = {
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
  plugins: [
    new webpack.DefinePlugin({
      API_HOST: JSON.stringify('localhost:8081')
    })
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
//  plugins: [new BundleAnalyzerPlugin()]
}
