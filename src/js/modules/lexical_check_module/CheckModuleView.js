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
		var data = null;
		// fetchDataFunction('eph',
		// 	//progressCallback
		// 	function(done, max) {
		// 		console.log('Progress: ' + done + '/' + max);
		// 	},
		// 	//callback
		// 	function(error, fetchData) {
		// 		if (error) {
		// 			console.error(error);
		// 		}
		// 		else {
		// 			data = fetchData;
		// 			console.dir(data);
		// 		}
		// 	}
		// );

		// var fetcher = new Door43DataFetcher();
		// fetcher.getBook('eph', 
		// 	function(current, total) {
		// 		console.log('Current: ' + current + ' / Total: ' + total);
		// 	},
		// 	function(error, data) {
		// 		if (error) {
		// 			console.error(error);
		// 		}
		// 		else {
		// 			console.dir(data);
		// 		}
		// 		fetcher.getBook('eph');
		// 	}
		// );

		var tWfetcher = new tWFetcher();
		tWfetcher.getWordList(null, function(error, data) {
			if (error) {
				console.error(error);
			}
			console.dir(data);
		});
	},

	render: function() {
		return (
			<div>hi</div>
		);
	}
});

module.exports = LexicalCheckModule;