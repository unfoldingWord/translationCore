
(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');

// var db = require('./db-init');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const LexicalCheck = require('./modules/lexical_check_module/CheckModuleView.js');

  var App = {
    init: function() {
    	ReactDOM.render(
        <LexicalCheck />,
    		document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);