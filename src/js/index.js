
(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const Well = require('react-bootstrap/lib/Well.js');

// var db = require('./db-init');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const LexicalChecker = require('./modules/lexical_checker/LexicalChecker');
  const TranslationNotesComponent = require('./modules/translation_notes/TranslationNotesComponent');
  const TranslationWordsDisplay = require('./modules/translation_words/TranslationWordsDisplay');

  var Lexical = React.createClass({
  	render: function() {
  		return (
  			<Well
  				style={{
  					maxWidth: "50%"
  				}}
  			>
  				<TranslationWordsDisplay />
  				<LexicalChecker />
  			</Well>
  		);
  	}
  })

  var App = {
    init: function() {
    	ReactDOM.render(
    		<TranslationNotesComponent />,
    		document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);