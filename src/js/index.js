
(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
// var db = require('./db-init');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const LexicalChecker = require('./modules/lexical_checker/LexicalChecker');
  const TranslationNotesComponent = require('./modules/translation_notes/TranslationNotesComponent');

  var App = {
    init: function() {
    	ReactDOM.render(<TranslationNotesComponent />,
    		document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);