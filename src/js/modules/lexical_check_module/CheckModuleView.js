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

const LexicalCheckModule = React.createClass({

	//Dummy function that only tests data right now
	componentWillMount: function() {
		var lexicalData = null;

		fetchDataFunction('eph', function(progress) {
			console.log('Progess: ' + progress);
		}, function(error, data) {
			if (error) {
				console.error(error);
			}
			else {
				lexicalData = data;
				console.dir(lexicalData);
			}
		});
	},

	render: function() {
		return (
			<div>hi</div>
		);
	}
});

module.exports = LexicalCheckModule;