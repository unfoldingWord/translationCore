
//TranslationWordsDisplay.js//

//Node Modules
var React = require('react');
var Markdown = require('react-remarkable');

//Bootstrap
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var Well = require('react-bootstrap/lib/Well.js');
var ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');


//Components
var TranslationWordsScraper = require('./TranslationWordsScraper');


//english constants
var DEFAULT = 'translationWords',
	WORD_QUERY = 'Type in word from translationWords',
	DEFAULT_PLACEHOLDER = 'ex: aaron'

var TranslationWordsDisplay = React.createClass({

	tWHtmlScraper: null,

	wordList: null,

	currentMarkdown: null,

	getInitialState: function() {
	    return {
	    	wordListEmpty: true,
	    	currentWord: null,
	    	dropdownPushed: false,
	    	placeHolder: DEFAULT_PLACEHOLDER,
	    	value: '',
	    	markdownToggle: false
	    };
	},

	componentWillMount: function() {
		var _this = this;
	    this.tWHtmlScraper = new TranslationWordsScraper();
	    
	    this.tWHtmlScraper.getWordList(
	    	null, //link

			function(data) { //assignCallback
				_this.wordList = data;
				_this.setState({
					wordListEmpty: false
				});
				console.log('done');
			},

			function() { //errorCallback
				console.error('Words Scraper failed');
			}
		);
	},

	render: function() {
		var _this = this;
		return (
			<Well>
				<div
					style={{
						textAlign: "center"
					}}
				>
					<form
						onSubmit={function(e) {
							e.preventDefault();
							_this.displayWord(_this.state.value)
							
						}}
		    		>
						<FormGroup
		    				validationState={this.getValidationState()}
						>
							<ControlLabel>{WORD_QUERY}</ControlLabel>
							<FormControl
		    					type="text"
		    					value={this.state.value}
		    					placeholder={this.state.placeHolder}
		    					onChange={this.handleChange}
		    					disabled={this.state.disabled}
							/>
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</div>
				<br />
				<div
					style={{
						minHeight: "200px",
						maxHeight: "300px",
						overflowY: "scroll"
					}}
				>
					{this.currentMarkdown}

				</div>
			</Well>
		);
	},

	displayWord: function(word) {
		this.setState({
			currentWord: word
		});
		var rawMarkdown = null;
		var _this = this;
		this.tWHtmlScraper.getWord(word + '.md',
			function(file) { //assign callback
				rawMarkdown = file;
				_this.setCurrentMarkdown(
					<Markdown
						source={rawMarkdown}
					/>
				);
			}
		);
	},


	setCurrentMarkdown: function(markdownComponent) {
		this.currentMarkdown = markdownComponent;
		this.setState({
			markdownToggle: !this.state.markdownToggle
		});
	},

	handleChange: function(e) {
		this.setState({
			value: e.target.value
		});
	},

	changePlaceHolder: function(value) {
		this.setState({
			placeHolder: value
		});
	},

	getValidationState: function() {
		if (this.state.wordListEmpty) {
			return 'warning';
		}
		if (this.state.value + '.md' in this.wordList) {
			return 'success';
		}
		return 'error';
	}

});


module.exports = TranslationWordsDisplay;