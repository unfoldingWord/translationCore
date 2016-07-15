(function() {
  // added by EW, necessary for dynamic JSX compilation
  require("babel-register")({
    extensions: [".js", ".jsx"]
  });
  const ReactDOM = require('react-dom');
  const React = require('react');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const MenuBar = require('../components/core/MenuBar');

  const ProposedChanges = require('../components/modules/proposed_changes_module/ProposedChanges.js');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);

      var Application = require("./app");

      ReactDOM.render(Application, document.getElementById('content'));
    }
  };
  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
