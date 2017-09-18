(function () {
  try {
    require("babel-register")({
      extensions: [".js", ".jsx"],
      presets: ["es2015", "react"],
      plugins: ["transform-object-rest-spread"]
    });
  } catch (error) {
    console.log('Bypass babel in production');
  }
  const path = require('path');
  window.__base = path.join(__dirname, '../../../');
  const ReactDOM = require('react-dom');
  const React = require('react');
  const remote = require('electron').remote;
  const {Menu} = remote;
  const MenuBar = require('../components/MenuBar');
  var App = {
    init: function () {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = require("./root").App;
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };
  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
