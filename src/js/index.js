
(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const Well = require('react-bootstrap/lib/Well.js');

// var db = require('./db-init');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const TestComponent = require('./modules/ULBTestComponent');

  var App = {
    init: function() {
    	ReactDOM.render(
    		<TestComponent />,
    		document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);