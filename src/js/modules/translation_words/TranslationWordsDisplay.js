
//TranslationWordsDisplay.js//

//Node Modules
var React = require('react');
var Remarkable = require('remarkable');
var md = new Remarkable();

//Components
var TranslationWordsScraper = require('./TranslationWordsScraper');

var TranslationWordsDisplay = React.createClass({

	tWHtmlScraper: null,

	wordList: null,

	getInitialState: function() {
	    return {
	    	wordListEmpty: true
	    };
	},

	componentWillMount: function() {
	      this.tWHtmlScraper = new TranslationWordsScraper();
	      this.tWHtmlScraper.getWordList(null, //link
			function(data) { //assignCallback
				console.log('Done');
				_this.wordList = data;
				_this.setState({
					wordListEmpty: false
				});
			}, 

			function() { //errorCallback
				console.error('Words Scraper failed');
			}
		);
	},

	render: function() {
		<span>
			<Well>
				<div>
				</div>
			</Well>
		</span>
	}
});