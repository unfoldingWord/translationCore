(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const CheckModuleView = require('../components/modules/phrase_check_module/CheckModuleView');

  const remote = window.electron.remote;
  const {Menu} = remote;
  const TPane = require('../components/core/TPane');
  const OpenModal = require('../components/core/AccessProjectModal');
// var db = require('./db-init');
  const NavBarComponent = require('../components/core/NavBarComponent');
  const LoginModal = require('../components/core/LoginModal');
  const UploadModal = require('../components/core/UploadModal');
  const MenuBar = require('../components/core/MenuBar');
  const SettingsModal = require('../components/core/SettingsModal');
  const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = (
        <div>
          <NavBarComponent />
          <LoginModal />
          <TPane />
          <UploadModal />
          <CheckModuleView />
          <SwitchCheckModuleDropdown />
          <SettingsModal />
          <OpenModal />
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
