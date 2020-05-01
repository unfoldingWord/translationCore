const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  entry: '.',
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'main.js',
  },
  devtool: 'inline-source-map',
  target: 'electron-main',
  mode: 'production',
  node: {
    // TRICKY: don't let webpack hard-code these
    __dirname: false,
    __filename: false,
  },
};
