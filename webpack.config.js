
var webpack = require('webpack');

module.exports = {
  entry: {
    app: ['./entry.js'],
  },

  output: {
    path: './dist',
    filename: 'bundle.app.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
}
