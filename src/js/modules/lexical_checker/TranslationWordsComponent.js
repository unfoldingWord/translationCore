
//TranslationWords//

//Node modules
var React = require('react');
var ReactDOM = require('react-dom');


//Module imports
var TranslationNotesHTMLScraper = require('./HTMLScraper.js');
var FileUploader = require('./FileUploader.js');
var ErrorModal = require('./ErrorModal.js');

//Bootstrap for dayz
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
var Well = require('react-bootstrap/lib/Well.js');
var Button = require('react-bootstrap/lib/Button.js');
var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
var Modal = require('react-bootstrap/lib/Modal.js');
var HelpBlock = require('react-bootstrap/lib/HelpBlock.js');
var ProgressBar = require('react-bootstrap/lib/ProgressBar.js');

//hardcoded english constants
var BOOK_QUERY = 'Type in Book Name',
    BOOK_EXAMPLE = 'Ex: "Ephesians"',
    DOWNLOAD_BOOK = "Download Book",
    UPLOAD_FROM_COMPUTER = "Retrieve Book",
    SAVE_TO_COMPUTER = "Save Book",
    QUERYING_BOOKS = "Retrieving information",
    DISCONNECTED_TITLE = "Disconnected From Internet",
    DISCONNECTED_MESSAGE = "Failed to retrieve a list of books from: ",
    CLOSE = "Close",
    UPLOAD_FILE = "Upload File",
    JSON_SPECIFIER = "Drag and drop or click to import .JSON file";


var TranslationWordsComponent = React.createClass({
    //this requires the internet, which at some point there needs to be a way to get the information
    //from local storage
    tNHtmlScraper: new TranslationNotesHTMLScraper(),
    
    bookAbbreviations: null,
    currentlyLoadedBooks: {},
    currentBook: null,
    errorThrown: false,

    getInitialState: function() {
		return {
	    	downLoadButtonDisabled: true,
	    	saveButtonDisabled: true,
	    	showProgressBar: false,
	    	currentDownloadProgress: 0,
	    	maxDownloadProgress: 0
		}
    },
    
    componentWillMount: function() {
		var _this = this;
		this.tNHtmlScraper.getBookAbbreviations( 
		    function(abbreviations) { //setter function
				_this.bookAbbreviations = abbreviations;
				if (_this.refs.BookForm) {
			    	_this.refs.BookForm.changeText(_this.refs.BookForm.state.value); /* 
													this makes the form change state and 
													updates the little icon to show the 
													user we've gotten the list of books
													from the internet
												     */
			    	_this.refs.BookForm.changePlaceHolder(BOOK_EXAMPLE);
			    	_this.refs.BookForm.changeStyle({
						cursor: 'auto'
			    	});
				}
		    },
		    null, //finishedFunction
		    function() { //error function
				_this.showModal();
		    }
		);
    },

    showModal: function() {
    	if (this.refs.errorModal) {
			this.refs.errorModal.show();
		}
		//disable the book form because we've had an error
		if (this.refs.BookForm) {
			this.refs.BookForm.changeDisabled(true); 
			this.refs.BookForm.changeStyle({
				cursor: 'not-allowed'
			});
		}

		this.errorThrown = true;
    },

    getUploadFile: function() {
    },

    disableDownloadButton: function() {
    	if (!this.state.downLoadButtonDisabled) {
    		this.setState({
    			downLoadButtonDisabled: true
    		});
    	}
    },

    enableDownloadButton: function() {
    	if (this.state.downLoadButtonDisabled) {
    		this.setState({
    			downLoadButtonDisabled: false
    		});
    	}
    },


    render: function() {
		var _this = this;

		if (false) {
		    return (
			    <UploadForm />
		    );
		}
		else {
		    return (
				<div>
					<Well
						style={{
							display: this.state.showProgressBar ? 'block' : 'none'
						}}
					>
						<ProgressBar
							
							now={this.state.currentDownloadProgress}
							min={0}
							max={this.state.maxDownloadProgress}
						/>
					</Well>
					{/* This isn't shown until showModal is called */ }
					<ErrorModal
						ref={'errorModal'}
						glyph={
							<Glyphicon
								glyph="remove-circle"
								style={{
									color: 'red'
								}}
							/>
						}
						buttons={[
							<UploadButton 
								callback={this.uploadFile}
								key={1}
							/>
						]}
						message={DISCONNECTED_MESSAGE + ' ' + this.tNHtmlScraper.getBaseLink()}
						title={DISCONNECTED_TITLE}
					/>

					<BookForm
			    		validateBook = {this.validateBook}
			    		ref = {'BookForm'}
			    		enableDownload={this.enableDownloadButton}
			    		disableDownload={this.disableDownloadButton}
					/>
					<br />
					<ButtonGroup>
						<UploadButton 
							callback={this.uploadFile}
						/>
						{/* Download button */}
						<Button 
			    			onClick = {this.getBook}
			    			disabled = {this.state.downLoadButtonDisabled}
						>
							<Glyphicon
			    				glyph='download'
							/>
							<span>
								{' ' + DOWNLOAD_BOOK}
			    			</span>
						</Button>
						{/* Save button */}
						<Button 
							onClick = {this.saveBook}
							disabled = {this.state.saveButtonDisabled}
						>
							<Glyphicon
								glyph='floppy-disk'
							/>
							<span>
								{' ' + SAVE_TO_COMPUTER}
							</span>
						</Button>
					</ButtonGroup>
				</div>
		    );
		}
    },

    saveBook: function() {
    	var filePath = '/assets/translationNotes/' + this.currentBook['abbreviation'] + '.json';
    	FS.outputJson(filePath, this.currentBook, 
    		function(err) {
    			if (err) {
    				//error
    			}
    		} 
    	);
    },

    getBook: function() {
    	/*
    	if (event && event.keyCode && event.keyCode == ENTER_KEY && 
    		this.refs.BookForm && validateBook(this.refs.BookForm.getValue()) == 'success') {
    		//just call the function again without an event
    		this.getBook();
    	}
    	else if (event) {
    		//event was passed but not enter_key
    		return;
    	}
		*/	
    	if (!this.refs.BookForm) { //sanity check
    		return;
    	}
    	var _this = this;
    	var bookAbr = this.refs.BookForm.getValue();

    	this.setState({
    		showProgressBar: true
    	});
    	this.refs.BookForm.setHidden(true);
    	
    	this.setState({
    		currentDownloadProgress: 0
    	});

    	this.tNHtmlScraper.downloadEntireBook(bookAbr,
    		function(finished, max) { //progress callback
    			//console.log('finished: ' + finished + '/' + max);
    			_this.setState({    				
    				currentDownloadProgress: finished,
    				maxDownloadProgress: max
    			});
    		},
    		function() { //done callback
    			_this.currentlyLoadedBooks[bookAbr] = _this.tNHtmlScraper.getBook(bookAbr);
    			_this.currentlyLoadedBooks[bookAbr]['abbreviation'] = bookAbr;

    			_this.refs.BookForm.setHidden(false);
    			console.log('Done');
    			var doesCurrentBookExist = _this.currentBook != null;
    			_this.currentBook = _this.currentlyLoadedBooks[bookAbr];
    			_this.setState({
    				showProgressBar: false,
    				saveButtonDisabled: doesCurrentBookExist
    			});
    		}
    	);
    },

    validateBook: function(str) {
    	if (this.errorThrown) {
			/*An error was thrown and we're unable to 
				access the bookAbbreviations
			*/
			
    		return 'error';
    	}
		if (!this.bookAbbreviations) { /* this is hacky, it will show a warning
						  				even if the user has typed in a valid 
										book before we've gotten the book names
										from the gogs server using the HTML scraper
					     			  */
			
		    return 'warning';
		}
		if (str in this.bookAbbreviations) {
				    
		    return 'success';
		}
		else {
			
		    return 'error';
		}
    }
});

//UploadForm
var UploadForm = React.createClass({

    uploadFile: function(text) {
		
    },
    
    render: function() {
		return (
			<Well
		    	bsSize="sm"
			>
				<FileUploader 
					callback={this.uploadFile}
					prompt={JSON_SPECIFIER}
				/>
			</Well>
		);
    }  
});

/* A button that presumably triggers the upload form. Defined here so that it can
	be used in more than one component
*/
var UploadButton = React.createClass({
	render: function() {
		return (
			<Button
	    		onClick={this.props.callback}
			>
		
				<Glyphicon
	    			glyph='upload'
				/>
				<span>
					{' ' + UPLOAD_FROM_COMPUTER}
	    		</span>
			</Button>
		);		
	}
});

//BookForm
var BookForm = React.createClass({
    
    getInitialState: function() {
		return {
		    value: '',
		    placeHolder: QUERYING_BOOKS,
		    style: {
				cursor: 'wait'
		    },
		    disabled: false,
		    hidden: false
		};
    },

    validationState: null,

    getValidationState: function() {
		var value = this.state.value;
		this.validationState = this.props.validateBook(value);
		return this.validationState;
    },

    handleChange: function(event) {
		this.setState({
	    	value: event.target.value
		});
		var validation = this.props.validateBook(event.target.value)
		if (validation == 'success') {
			this.props.enableDownload();
		}
		else {
			this.props.disableDownload();
		}
    },

    getValue: function() {
    	return this.state.value;
    },

    changeText: function(str) {
		this.setState({
	    	value: str
		});
    },

    changePlaceHolder: function(str) {
		this.setState({
	    	placeHolder: str
		});
    },

    changeStyle: function(style) {
		this.setState({
	    	style: style
		});	    
    },

    changeDisabled: function(disabled) {
    	this.setState({
    		disabled: disabled
    	});
    },
    
    setHidden: function(value) {
    	this.setState({
    		hidden: value
    	});
    },

    render: function() {
		return (
			<Well
				style={{
					display: this.state.hidden ? 'none' : 'block'
				}}
				bsSize="sm">
				<form>
					<FormGroup
	    				validationState={this.getValidationState()}
					>
						<ControlLabel>{BOOK_QUERY}</ControlLabel>
						<FormControl
	    					type="text"
	    					value={this.state.value}
	    					placeholder={this.state.placeHolder}
	    					onChange={this.handleChange}
	    					style={	
								this.state.style
	    					}
	    					disabled={this.state.disabled}
						/>
						<FormControl.Feedback />
					</FormGroup>
				</form>
			</Well>
		);
    }
});

module.exports = TranslationWordsComponent;
