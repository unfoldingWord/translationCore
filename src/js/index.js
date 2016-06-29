(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
// var db = require('./db-init');
  const FileUpload = require('./fileupload');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const menubar = require('./menubar');
  const CommentBox = require('./CommentBox');
  const NextButton = require('./NextButton');
  const NewProjectScreen = require('./NewProjectScreen');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(menubar.template);
      Menu.setApplicationMenu(menu);
      ReactDOM.render(<NewProjectScreen />, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
