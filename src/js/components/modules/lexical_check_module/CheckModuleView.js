//CheckModuleView.js//

/**
 * @description - The main view for the Lexical Check Modules
 * @author Sam Faulkner
 */

//Node Module imports
const React = require('react');

//User imports
//Won't be required in final version
const fetchDataFunction = require('./FetchData.js');
const Door43DataFetcher = require('../translation_notes/Door43DataFetcher.js');
const tWFetcher = require('./translation_words/TranslationWordsFetcher.js');
const LexicalView = require('./lexical_checker/LexicalChecker.js');
const TranslationWordDisplay = require('./translation_words/TranslationWordsDisplay.js');

const LexicalCheckModule = React.createClass({

	componentWillMount: function() {

	},

	componentWillUnmount: function() {
	      
	},

	render: function() {
		return (
			<div>hi</div>
		);
	}
});

module.exports = LexicalCheckModule;