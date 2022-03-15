const path = require('path');
const dotenv = require('dotenv');

/**
 * try different configs until one works (different paths for prod and dev)
 */
function initEnv() {
  const dotnetEnvPaths = [path.join(__dirname, 'cfg.txt'), path.join(__dirname, '../../../.env')];

  for (const envPath of dotnetEnvPaths) {
    dotenv.config({ path: envPath });
    const env = dotenv.config()?.parsed;

    if (env && Object.keys(env).length) {
      console.log(`found env at ${envPath}`, env);
      break;
    }
  }
}

initEnv();

(function () {
  const ReactDOM = require('react-dom');

  window.App = {
    init: function () {
      const Application = require('./root').App;
      ReactDOM.render(Application, document.getElementById('content'));
    },
  };
})();
document.addEventListener('DOMContentLoaded', window.App.init);
