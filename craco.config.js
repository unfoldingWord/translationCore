const { ESLINT_MODES } = require('@craco/craco');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: {
      target: 'electron-renderer',
      node: {
        // TRICKY: don't let webpack hard-code these
        __dirname: false,
        __filename: false,
      },
      plugins: [
        new CopyWebpackPlugin([
          { from: './tcResources', to: 'static/tCResources' },
          { from: './src/tC_apps', to: 'static/tC_apps' },
          { from: './src/locale', to: 'static/locale' },
        ]),
      ],
    },
  },
  eslint: { mode: ESLINT_MODES.file },
};
