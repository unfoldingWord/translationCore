(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const TPane = require('./tpane');
// var db = require('./db-init');
  const UploadModal = require('./uploadmodal');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const menubar = require('./menubar');
<<<<<<< HEAD

var Root = require('./root');
=======
>>>>>>> f9a902cd6ce4624b3751918a67ac67d29cbc6869

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(menubar.template);
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
