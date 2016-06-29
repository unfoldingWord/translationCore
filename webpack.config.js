
var webpack = require('webpack');

module.exports = {
  entry: {
    app: ['webpack/hot/dev-server', './entry.js'],
  },

  output: {
    path: './dist',
    filename: 'bundle.app.js',
    publicPath: 'http://localhost:8080/dist/'
  },

  devServer: {
    contentBase: './',
    publicPath: 'http://localhost:8080/dist/'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
