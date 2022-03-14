const path = require('path');
const dotenv = require('dotenv');
const dotnetEnvPath = path.join(__dirname, '../../../.env');
dotenv.config({ path: dotnetEnvPath });
const STARTUP_CONFIG = dotenv.config()?.parsed;
console.log('config', STARTUP_CONFIG);

(function () {
  const ReactDOM = require('react-dom');

  const config = dotenv.config()?.parsed;

  if (!config) {
    console.log(`second attempt to init dotenv`);
    dotenv.config({ path: path.join(__dirname, '../../../.env') });
    console.log('config', dotenv.config()?.parsed);
  }

  window.App = {
    init: function () {
      const Application = require('./root').App;
      ReactDOM.render(Application, document.getElementById('content'));
    },
  };
})();
document.addEventListener('DOMContentLoaded', window.App.init);
