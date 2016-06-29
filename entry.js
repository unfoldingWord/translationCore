
var ReactDOM = require('react-dom');
var React = require('react');

var LexicalChecker = require('./src/js/modules/lexical_checker/LexicalChecker.js');
var TranslationWordsComponent = require('./src/js/modules/lexical_checker/TranslationWordsComponent.js');

ReactDOM.render(<TranslationWordsComponent />, 
	document.getElementById('content'));

