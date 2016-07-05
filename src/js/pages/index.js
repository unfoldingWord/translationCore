(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');

  const remote = window.electron.remote;
  const {Menu} = remote;
<<<<<<< HEAD:src/js/index.js
  const menubar = require('./menubar');
<<<<<<< HEAD

var Root = require('./root');
=======
>>>>>>> f9a902cd6ce4624b3751918a67ac67d29cbc6869
=======

  const TPane = require('../components/TPane');
// var db = require('./db-init');
  const UploadModal = require('../components/UploadModal');
  const MenuBar = require('../components/MenuBar');
>>>>>>> 2cda52a4fa2eb067f3166b6953f9f5f44da0a6be:src/js/pages/index.js

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
<<<<<<< HEAD
      ReactDOM.render(<Root />, document.getElementById('content'));
=======
      var Application = (
        <div>
          <TPane />
          <UploadModal />
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
>>>>>>> f9a902cd6ce4624b3751918a67ac67d29cbc6869
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
