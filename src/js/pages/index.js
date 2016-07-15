(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const CheckModuleView = require('../components/modules/phrase_check_module/CheckModuleView');

  const remote = window.electron.remote;
  const {Menu} = remote;
  const TPane = require('../components/core/TPane');

// var db = require('./db-init');
  const NavBarComponent = require('../components/core/NavBarComponent');
  const LoginModal = require('../components/core/LoginModal');
  const UploadModal = require('../components/core/UploadModal');
  const MenuBar = require('../components/core/MenuBar');
  const SettingsModal = require('../components/core/SettingsModal');
  const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
  const ProjectModal = require('../components/core/ProjectModal')

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
          <ProjectModal />
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
