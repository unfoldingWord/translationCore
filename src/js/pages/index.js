(function() {
  // added by EW, necessary for dynamic JSX compilation
  require("babel-register")({
    extensions: [".js", ".jsx"]
  });
  const ReactDOM = require('react-dom');
  const React = require('react');
  const PhraseModuleView = require('../components/modules/phrase_check_module/CheckModuleView');
  const LexicalModuleView = require('../components/modules/lexical_check_module/CheckModuleView');

  const NavMenu = require('../components/core/NavigationMenu');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const TPane = require('../components/core/TPane');

  const NavBarComponent = require('../components/core/NavBarComponent');
  const LoginModal = require('../components/core/LoginModal');
  const UploadModal = require('../components/core/UploadModal');
  const MenuBar = require('../components/core/MenuBar');
  const SettingsModal = require('../components/core/SettingsModal');
  const RootStyles = require('./RootStyle');
  const Grid = require('react-bootstrap/lib/Grid.js');
  const Row = require('react-bootstrap/lib/Row.js');
  const Col = require('react-bootstrap/lib/Col.js');
  const NextButton = require('../components/core/NextButton');
  const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = require("./app");
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };
  App.init();
  window.App = App;
})();
//document.addEventListener('DOMContentLoaded', App.init);
