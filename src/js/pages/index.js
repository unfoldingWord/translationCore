const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
(function () {
  // require('babel-polyfill'); // needed for es6 usage.
  const ReactDOM = require('react-dom');
  const remote = require('electron').remote;
  const { Menu } = remote;
  const MenuBar = require('../components/MenuBar');

  window.App = {
    init: function () {
      let menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      let Application = require('./root').App;
      ReactDOM.render(Application, document.getElementById('content'));
    },
  };
})();
document.addEventListener('DOMContentLoaded', window.App.init);
