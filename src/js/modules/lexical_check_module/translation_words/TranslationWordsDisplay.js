
//TranslationWordsDisplay.js//

//Node Modules
const React = require('react');
const Markdown = require('react-remarkable');

//Bootstrap
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const Well = require('react-bootstrap/lib/Well.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const Button = require('react-bootstrap/lib/Button.js');

//Components
const TranslationWordsScraper = require('./TranslationWordsScraper');
const ErrorModal = require('./ErrorModal');

//english constants
const DEFAULT = 'translationWords',
	WORD_QUERY = 'Type in word from translationWords',
	DEFAULT_PLACEHOLDER = 'ex: rehoboam',
	CLOSE = 'Close',
	PLEASE_WAIT_TITLE = 'Please wait...',
	PLEASE_WAIT_MESSAGE = 'Please wait while translationWords information is being downloaded',
	UNABLE_TO_GET_WORDS_MESSAGE = 'Unable to get translationWords from URL: ',
	UNABLE_TO_GET_WORDS_TITLE = 'Unable to download information',
	UNABLE_TO_GET_WORDS_SHORT = 'Unable to retrieve list of words';

const TranslationWordsDisplay = React.createClass({

	tWHtmlScraper: null,

	wordList: null,

	currentMarkdown: null,

	currentModal: null,

	previousModals: [],

	getInitialState: function() {
	    return {
	    	wordListEmpty: true,
	    	currentWord: null,
	    	dropdownPushed: false,
	    	placeHolder: DEFAULT_PLACEHOLDER,
	    	value: '',
	    	markdownToggle: false,
	    	showModal: true,
	    	shouldShowBox: false
	    };
	},

	componentWillMount: function() {
		var _this = this;
	    this.tWHtmlScraper = new TranslationWordsScraper();
	    
	    this.setCurrentModal(
	    	<Modal show={true} onHide={_this.modalClosed}>
    			<Modal.Header>
    				<Modal.Title>
    					<span>
    						<Glyphicon
    							glyph="alert"
    							style={{
    								color: "orange"
    							}}
    						/>
    						{' ' + PLEASE_WAIT_TITLE}
    					</span>
    				</Modal.Title>
    			</Modal.Header>
    			<Modal.Body
    				style={{
    					textAlign: 'center'
    				}}
    			>
    				<p>
    					<img src="./src/js/modules/lexical_check_module/translation_words/default.gif"></img>
    				</p>
    				{PLEASE_WAIT_MESSAGE}
    			</Modal.Body>
    			<Modal.Footer>
    			</Modal.Footer>
    		</Modal>
	    );

	    this.tWHtmlScraper.getWordList(
	    	null, //link

			function(data) { //assignCallback
				_this.wordList = data;
				_this.setState({
					wordListEmpty: false
				});
				_this.modalClosed();
			},

			function() { //errorCallback
				console.error('Words Scraper failed');
				_this.modalClosed(); /* we're going to put up another modal
										but we don't want to revert back to the old
										one once user clicks out of the errormodal
									*/
				_this.changePlaceHolder(UNABLE_TO_GET_WORDS_SHORT);
				_this.setCurrentModal(
					<ErrorModal
						glyph={
							<Glyphicon
								glyph={"remove-circle"}
								style={{
									color: 'red'
								}}
							/>
						}
						
						message={UNABLE_TO_GET_WORDS_MESSAGE + _this.tWHtmlScraper.getLink()}
						title={UNABLE_TO_GET_WORDS_TITLE}
						closeCallback={
							function() {
								_this.modalClosed();
							}
						}
					/>
				);
			}
		);
	},

	//sets the current modal, or, if there already is one, pushes the old one onto a stack
	setCurrentModal: function(modal) {
    	if (this.currentModal) {
    		this.previousModals.push(this.currentModal);
    		this.currentModal = null;
    	}
    	this.currentModal = modal;
    	this.setState({
    		showModal: true
    	});
    },

    modalClosed: function() {
    	if (this.currentModal) { //sanity check
    		this.currentModal = this.previousModals.pop() || null;
    	}

    	this.setState({
    		showModal: (this.currentModal != null)
    	});
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
					{this.currentModal}
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
							/>
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</div>
				
				<div
					style={{
						minHeight: "250px",
						maxHeight: "250px",
						overflowY: "scroll"
					}}
				>
					{this.currentMarkdown}

				</div>
			</Well>
		);
	},

	/**
	 * Sets the attribute 'currentMarkdown' from the file returned from
	 * the htmlscraper
	*/ 
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
		if (!this.wordList) { //failed to get wordlist from internet
			return 'error';
		}
		if (this.state.value.length <= 0) { //user hasn't typed anything
			return;
		}
		
		if (this.state.value + '.md' in this.wordList) { //yay!
			return 'success';
		}
		return 'error'; //boo
	}

});

module.exports = TranslationWordsDisplay;