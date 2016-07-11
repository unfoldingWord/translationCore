(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');

  const remote = window.electron.remote;
  const {Menu} = remote;
  const TPane = require('../components/core/TPane');
  const CheckModuleView = require('../components/modules/phrase_check_module/CheckModuleView');
  const NavigationMenu = require('../components/NavigationMenu')
  
// var db = require('./db-init');
  const UploadModal = require('../components/core/UploadModal');
  const MenuBar = require('../components/core/MenuBar');
  const SettingsModal = require('../components/core/SettingsModal');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = (
        <div>
          <TPane />
          <UploadModal />
          <SettingsModal />
          <NavigationMenu />
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
