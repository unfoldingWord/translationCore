/*
  lexicalChecker.js
*/

var React = require('react');

var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var Well = require('react-bootstrap/lib/Well.js');
var Button = require('react-bootstrap/lib/Button.js');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');

var TranslationNotesHTMLScraper = require('./HTMLScraper.js');

var dummyDefinition = "WORD: A WORD";
var targetLanguage = "a word and another word";

var REPLACE_TEXT = "Replace";
var RETAIN_TEXT = "Retain";
				 
var LexicalChecker = React.createClass({
    getInitialState: function() {
	this.getAbbreviations();
	return {};
    },
    
    render: function() {
	return (
		<div id="lexical-checker">
			<Well bsSize={'small'}>
				<Definition 
	    				definition={dummyDefinition} 
				/>
				<TargetLanguageSelectBox 
	    				ref={'targetLanguageBox'}
	    				buttonDisableCallback={this.buttonDisable}
	    				buttonEnableCallback={this.buttonEnable}
				/> 
				<br />
				<CustomButtonGroup
	    				submitWordsCallback={this.submitWords}
	    				replaceWordsCallback={this.replaceWords}
	    				ref={'customButtonGroup'}
				/>
		
	    </Well>
		</div>
	);
    },

    bookAbbreviations: {},
    
    getAbbreviations: function() {
	this.htmlScraper = new TranslationNotesHTMLScraper();
	var _this = this;
	this.htmlScraper.downloadEntireBook('1ch',
					    function(done, max) { //progressCallback
						console.log('Progess: ' + done + '/' + max);
					    },
					    function() { //doneCallback
						console.log('Done');
						console.dir(_this.htmlScraper.getBook('1ch'));
					    }
					   );
    },
    
    submitWords: function() { //retain button callback
	var words = this.refs.targetLanguageBox.getWords();
	for (var i = 0; i < words.length; i++) {
	    console.log(words[i].word);
	}
    },

    replaceWords: function() { //replace button callback

    },

    buttonDisable: function() { //disable the buttons
	if (this.refs.customButtonGroup) {
	    this.refs.customButtonGroup.disableButtons();
	}
    },

    buttonEnable: function() { //enable the buttons
	if (this.refs.customButtonGroup) {
	    this.refs.customButtonGroup.enableButtons();
	}
    }    
});

//Contains the word being defined and the definition of the word
var Definition = React.createClass({
	render: function() {
		return (
			<p>{this.props.definition}</p>
		);
	}
});

/* Contains a word from the target language, defines a lot of listeners for clicks */
var TargetWord = React.createClass({
	// highlighted: false,
	getInitialState: function() {
		return {
			highlighted: false,
			wordObj: { //this is required to pass into our callbacks
				'word': this.props.word,
				'key': this.props.keyId
			}
		};
	},

	userClick: function() {
		//toggles the internal state and changes the actual style of the element
		this.toggleHighlight();
	},

	toggleHighlight: function() {
		if (!this.state.highlighted) {
			this.props.selectCallback(this.state.wordObj)
		}
		else {
			this.props.removeCallback(this.state.wordObj);
		}
		this.setState({highlighted: !this.state.highlighted}); //this sets React to re-render the component
		
	},

	render: function() {
		// if (this.state.highlighted) { //add the word to the parent's 'selectedWords' array
		// 	this.props.selectCallback(this.state.wordObj)   have to pass in an object because we have to check against
		// 											each word's key
												
		// }
		// else {
		// 	this.props.removeCallback(this.state.wordObj);
		// }
		
		return (<span 
					className={this.state.highlighted ? 'text-primary' : 'text-muted'}  
					onClick={this.userClick}
					style={this.props.style} //cursorPointerStyle from TargetLanguageSelectBox
				>
					{this.props.word}
				</span>
		);
	}
});

var TargetLanguageSelectBox = React.createClass({
	selectedWords: [], //holds wordObjects, each have {'word', 'key'} attributes

	cursorPointerStyle: {
		cursor: 'pointer'
	},

	render: function() {
		//populate an array with html elements then return the array
		var wordArray = targetLanguage.split(' ');
		var words = [];
		var wordKey = 0;
		if (this.selectedWords.length <= 0) {
			this.props.buttonDisableCallback();
		}
		else {
			this.props.buttonEnableCallback();
		}
		for (var i = 0; i < wordArray.length; i++) {
			words.push(<TargetWord 
							selectCallback={this.addSelectedWord}
							removeCallback={this.removeFromSelectedWords}
							key={wordKey++} //this is required for React to internally order the elements
							keyId={wordKey} /*  children can't access their own key (stupid right?) so 
												it has to be passed as a different prop that the child can
												access
											*/
							style={this.cursorPointerStyle}
							word={wordArray[i]} 
						/>);
			if (i != wordArray.length - 1) { //add a space if we're not at the end of the line
				words.push(<span 
								style={this.cursorPointerStyle}
								key={wordKey++}
							>{' '} 
							</span>
						   ); //even the spaces need keys! (but not keyId)
			}
		}
		return (
			<Well bsSize={'small'}>
				<span>{words}</span>
			</Well>
		);
	},

	addSelectedWord: function(wordObj) {
		//check to see if we already have this word
		//an inefficient search, but shouldn't have >10 words to search through
		var idFound = false;
		for (var i = 0; i < this.selectedWords.length; i++) {
			if (this.selectedWords[i].key == wordObj.key) {
				idFound = true;
			}
		}
		if (!idFound) {
			this.selectedWords.push(wordObj);
			this.sortSelectedWords();
		}

		if (this.selectedWords.length > 0) {
			this.props.buttonEnableCallback();
		}
	},

	removeFromSelectedWords: function(wordObj) {
		//get the word's index
		var index = -1;
		for (var i = 0; i < this.selectedWords.length; i++) {
			if (this.selectedWords[i].key == wordObj.key) {
				index = i;
			}
		}
		if (index != -1) {
			this.selectedWords.splice(index, 1);
		}
		
		if (this.selectedWords.length <= 0) {
			this.props.buttonDisableCallback();
		}
	},

	/* Sorts the selected words by their 'key' attribute */
	sortSelectedWords: function() {
		this.selectedWords.sort( function(first, next) {
			return first.key - next.key;
		});
	},

	getWords: function() {
		return this.selectedWords;
	}
});

var CustomButtonGroup = React.createClass({
	getInitialState: function() {
		return {
			disabled: true
		}
	},

	render: function() {
		return (
			<ButtonGroup>
				<Button //replace button
					onClick={this.props.replaceWordsCallback}
					disabled={this.state.disabled}
				>
					<Glyphicon
						glyph="random"
					/>
					{' ' + REPLACE_TEXT}
				</Button>
				<Button //retain button
					onClick={this.props.submitWordsCallback}
					disabled={this.state.disabled}
				>
					<Glyphicon
						glyph="ok"
					/>
					{' ' + RETAIN_TEXT}
				</Button>
			</ButtonGroup>
		);	
	},

	enableButtons: function() {
		this.setState({
			disabled: false
		});
	}, 

	disableButtons: function() {
		this.setState({
			disabled: true
		});
	}
});

module.exports = LexicalChecker;