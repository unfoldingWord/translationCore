const { ESLINT_MODES } = require("@craco/craco");

module.exports = {
  webpack: {
    configure: {
      target: 'electron-renderer'
    }
  },
  eslint: {
    mode: ESLINT_MODES.file
  },
};
