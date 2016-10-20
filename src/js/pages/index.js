(function() {
  require("babel-register")({
    extensions: [".js", ".jsx"],
    presets: ["react"]
  });
  (function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();
  const ReactDOM = require('react-dom');
  const React = require('react');
  const remote = require('electron').remote;
  const {Menu} = remote;
  var moduleApi = require('../ModuleApi');
  window.ModuleApi = moduleApi;
  const MenuBar = require('../components/core/MenuBar');

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
