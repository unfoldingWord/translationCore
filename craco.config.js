const { ESLINT_MODES } = require('@craco/craco');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (mode) => {
  console.log('Environment:', mode.env);
  const isProduction = mode.env === 'production';
  const copyPatterns = [
    { from: './tcResources', to: 'static/tcResources' },
    { from: './src/tC_apps', to: 'static/tC_apps' },
    { from: './src/locale', to: 'static/locale' },
    { from: './src/assets/projectLicenses', to: 'static/projectLicenses' },
    { from: './package.json', to: 'package.json' },
    { from: './electron/preloadSplash.js', to: 'preloadSplash.js' },
  ];

  return {
    webpack: {
      configure: {
        target: 'electron-renderer',
        // eval-source-map allows to set inline breakpoints, and step debug at statement-level.
        devtool: isProduction ? undefined : 'eval-source-map',
        node: {
        // TRICKY: don't let webpack hard-code these
          __dirname: false,
          __filename: false,
        },
        plugins: [
          new CopyWebpackPlugin(copyPatterns),
        ],
        resolve: {
          mainFields: ['module', 'main'],
        },
      },
    },
    eslint: { mode: ESLINT_MODES.file },
  };
};

