const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
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
