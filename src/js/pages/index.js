const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../../.env') });
console.log('config', dotenv.config()?.parsed);

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
